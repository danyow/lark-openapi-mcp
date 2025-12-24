import { McpTool } from '../../../../types';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { commonHttpInstance } from '../../../../../utils/http-instance';

// Tool name type
export type driveBuiltinToolName = 'drive.v1.exportTask.download';

export const larkDriveExportTaskDownloadTool: McpTool = {
  project: 'drive',
  name: 'drive.v1.exportTask.download',
  sdkName: 'drive.v1.exportTask.download',
  path: '/open-apis/drive/v1/export_tasks/file/:file_token/download',
  httpMethod: 'GET',
  accessTokens: ['user', 'tenant'],
  supportFileDownload: true,
  description:
    '[飞书/Lark]-云文档-云空间-文件-导出文档-下载导出文件-使用导出任务返回的 file_token 下载导出的文件。文件将保存到指定的输出目录，并返回本地文件路径。注意：导出的文件将在导出任务完成后 10 分钟内被删除。',
  schema: {
    path: z.object({
      file_token: z
        .string()
        .describe(
          '从导出任务（drive.v1.exportTask.get）返回的文件令牌。此令牌用于下载导出的文件。',
        ),
    }),
    params: z.object({
      output_dir: z
        .string()
        .describe(
          '下载文件的保存目录。如果未指定，默认使用系统临时目录。',
        )
        .optional(),
      file_name: z
        .string()
        .describe(
          '下载文件的名称（包含扩展名，例如 "document.xlsx"）。如果未指定，使用导出任务中的原始文件名。',
        )
        .optional(),
    }).optional(),
    useUAT: z.boolean().describe('使用用户访问令牌，否则使用租户访问令牌').optional(),
  },
  customHandler: async (client, params, options): Promise<any> => {
    try {
      const { userAccessToken } = options || {};
      const fileToken = params?.path?.file_token;

      if (!fileToken) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: JSON.stringify({ msg: 'file_token 是必需的' }) }],
        };
      }

      // Determine output directory and filename
      const outputDir = params?.params?.output_dir || os.tmpdir();
      const fileName = params?.params?.file_name || `export_${fileToken}`;

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filePath = path.join(outputDir, fileName);
      const debug: string[] = [];
      debug.push(`fileToken: ${fileToken}`);
      debug.push(`useUAT: ${params?.useUAT}, hasUserAccessToken: ${!!userAccessToken}`);

      // Get access token from SDK client
      let accessToken: string | undefined;
      if (userAccessToken && params?.useUAT) {
        accessToken = userAccessToken;
        debug.push('using user access token');
      } else {
        // Get tenant access token from client
        try {
          const tokenRes = await (client as any).tokenManager?.getTenantAccessToken();
          accessToken = tokenRes;
          debug.push('using tenant access token');
        } catch (tokenError: any) {
          debug.push(`failed to get tenant token: ${tokenError?.message}`);
        }
      }

      if (!accessToken) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: JSON.stringify({
            msg: '获取访问令牌失败',
            debug
          }) }],
        };
      }

      // Use commonHttpInstance directly (with proxy support) instead of SDK's download method
      const domain = (client as any).domain || 'https://open.feishu.cn';
      const downloadUrl = `${domain}/open-apis/drive/v1/export_tasks/file/${fileToken}/download`;
      debug.push(`downloadUrl: ${downloadUrl}`);

      const response = await commonHttpInstance.request({
        url: downloadUrl,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        responseType: 'stream',
        timeout: 60000, // 60 seconds timeout for download
      });

      debug.push(`response status: ${response.status}`);

      // Check if we got a valid stream response
      if (!response.data) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: JSON.stringify({
            msg: '下载文件失败：响应为空',
            debug
          }) }],
        };
      }

      // Write stream to file
      const writableStream = fs.createWriteStream(filePath);
      await new Promise<void>((resolve, reject) => {
        response.data.pipe(writableStream);
        writableStream.on('finish', resolve);
        writableStream.on('error', reject);
        response.data.on('error', reject);
      });
      debug.push('stream completed');

      // Check if file was created and get stats
      if (!fs.existsSync(filePath)) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: JSON.stringify({ msg: '下载文件失败：文件未创建', debug }) }],
        };
      }

      const stats = fs.statSync(filePath);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              file_path: filePath,
              file_name: fileName,
              file_size: stats.size,
              message: `文件下载成功，保存至 ${filePath}`,
            }),
          },
        ],
      };
    } catch (error: any) {
      // Handle API error responses
      if (error?.response?.data) {
        // For stream responses, we need to read the error from the stream
        const errorData = error.response.data;
        if (typeof errorData.pipe === 'function') {
          // It's a stream, try to read it
          const chunks: Buffer[] = [];
          for await (const chunk of errorData) {
            chunks.push(chunk);
          }
          const errorText = Buffer.concat(chunks).toString('utf-8');
          try {
            const errorJson = JSON.parse(errorText);
            return {
              isError: true,
              content: [{ type: 'text' as const, text: JSON.stringify({
                msg: 'API 错误',
                code: errorJson.code,
                error: errorJson.msg || '未知错误',
                hint: 'file_token 可能无效或已过期。导出的文件将在导出任务完成后 10 分钟内被删除。',
              }) }],
            };
          } catch {
            return {
              isError: true,
              content: [{ type: 'text' as const, text: JSON.stringify({
                msg: '下载导出文件失败',
                error: errorText,
              }) }],
            };
          }
        }
      }
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              msg: '下载导出文件失败',
              error: error?.response?.data || error?.message || String(error),
            }),
          },
        ],
      };
    }
  },
};

export const driveBuiltinTools = [larkDriveExportTaskDownloadTool];
