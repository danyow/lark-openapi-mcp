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
    '[Feishu/Lark]-Docs-Space-File-Export docs-Download export file-Download the exported file using the file_token returned from the export task. The file will be saved to the specified output directory and the local file path will be returned. Note: The exported file will be deleted 10 minutes after the export task completes.',
  schema: {
    path: z.object({
      file_token: z
        .string()
        .describe(
          'The file token returned from the export task (drive.v1.exportTask.get). This token is used to download the exported file.',
        ),
    }),
    params: z.object({
      output_dir: z
        .string()
        .describe(
          'The directory where the downloaded file will be saved. If not specified, defaults to system temp directory.',
        )
        .optional(),
      file_name: z
        .string()
        .describe(
          'The name for the downloaded file (including extension, e.g., "document.xlsx"). If not specified, uses the original file name from the export task.',
        )
        .optional(),
    }).optional(),
    useUAT: z.boolean().describe('Use user access token, otherwise use tenant access token').optional(),
  },
  customHandler: async (client, params, options): Promise<any> => {
    try {
      const { userAccessToken } = options || {};
      const fileToken = params?.path?.file_token;

      if (!fileToken) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: JSON.stringify({ msg: 'file_token is required' }) }],
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
            msg: 'Failed to get access token',
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
            msg: 'Failed to download file: empty response',
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
          content: [{ type: 'text' as const, text: JSON.stringify({ msg: 'Failed to download file: file was not created', debug }) }],
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
              message: `File downloaded successfully to ${filePath}`,
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
                msg: 'API error',
                code: errorJson.code,
                error: errorJson.msg || 'Unknown error',
                hint: 'The file_token may be invalid or expired. Export files are deleted 10 minutes after the export task completes.',
              }) }],
            };
          } catch {
            return {
              isError: true,
              content: [{ type: 'text' as const, text: JSON.stringify({
                msg: 'Failed to download export file',
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
              msg: 'Failed to download export file',
              error: error?.response?.data || error?.message || String(error),
            }),
          },
        ],
      };
    }
  },
};

export const driveBuiltinTools = [larkDriveExportTaskDownloadTool];
