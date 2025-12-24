import { McpTool } from '../../../../types';
import * as lark from '@larksuiteoapi/node-sdk';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

      // Use SDK's built-in download method which returns writeFile/getReadableStream
      let response: any;
      if (userAccessToken && params?.useUAT) {
        response = await client.drive.exportTask.download(
          { path: { file_token: fileToken } },
          lark.withUserAccessToken(userAccessToken)
        );
      } else {
        response = await client.drive.exportTask.download({ path: { file_token: fileToken } });
      }

      // Use the SDK's writeFile method to save the file
      if (response?.writeFile) {
        await response.writeFile(filePath);
      } else if (response?.getReadableStream) {
        // Fallback to stream if writeFile is not available
        const readableStream = response.getReadableStream();
        const writableStream = fs.createWriteStream(filePath);
        await new Promise<void>((resolve, reject) => {
          readableStream.pipe(writableStream);
          writableStream.on('finish', resolve);
          writableStream.on('error', reject);
          readableStream.on('error', reject);
        });
      } else {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: JSON.stringify({ 
            msg: '下载文件失败：SDK 响应不包含 writeFile 或 getReadableStream',
            debug: { responseKeys: response ? Object.keys(response) : [] }
          }) }],
        };
      }

      // Check if file was created and get stats
      if (!fs.existsSync(filePath)) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: JSON.stringify({ msg: '下载文件失败：文件未创建' }) }],
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
