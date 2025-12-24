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
            msg: 'Failed to download file: SDK response does not contain writeFile or getReadableStream',
            debug: { responseKeys: response ? Object.keys(response) : [] }
          }) }],
        };
      }

      // Check if file was created and get stats
      if (!fs.existsSync(filePath)) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: JSON.stringify({ msg: 'Failed to download file: file was not created' }) }],
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
