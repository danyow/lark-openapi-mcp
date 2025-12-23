import { z } from 'zod';

export type sheetsV2ToolName =
  | 'sheets.v2.spreadsheetValues.get'
  | 'sheets.v2.spreadsheetValues.batchGet'
  | 'sheets.v2.spreadsheetValues.update'
  | 'sheets.v2.spreadsheetValues.batchUpdate'
  | 'sheets.v2.spreadsheetValues.append'
  | 'sheets.v2.spreadsheetDimensionRange.insert'
  | 'sheets.v2.spreadsheetDimensionRange.delete';

/**
 * Read a single range of cells
 * GET /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values/:range
 */
export const sheetsV2SpreadsheetValuesGet = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.get',
  sdkName: 'sheets.v2.spreadsheetValues.get',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values/:range',
  httpMethod: 'GET',
  description:
    '[Feishu/Lark]-Docs-Sheets-Data-Read a single range-Read cell values from a specified range in a spreadsheet. The range format is sheet_id!A1:B2 or just A1:B2 for the first sheet',
  accessTokens: ['tenant', 'user'],
  schema: {
    params: z
      .object({
        valueRenderOption: z
          .enum(['ToString', 'Formula', 'FormattedValue', 'UnformattedValue'])
          .describe('How values should be rendered in the output. Default is ToString')
          .optional(),
        dateTimeRenderOption: z
          .enum(['FormattedString', 'SerialNumber'])
          .describe('How dates should be rendered. Default is FormattedString')
          .optional(),
      })
      .optional(),
    path: z.object({
      spreadsheet_token: z.string().describe('Spreadsheet token from the URL or API'),
      range: z.string().describe('Range to read, format: sheet_id!A1:B2 or A1:B2'),
    }),
    useUAT: z.boolean().describe('Use user access token, otherwise use tenant access token').optional(),
  },
};

/**
 * Read multiple ranges of cells
 * GET /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_batch_get
 */
export const sheetsV2SpreadsheetValuesBatchGet = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.batchGet',
  sdkName: 'sheets.v2.spreadsheetValues.batchGet',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_batch_get',
  httpMethod: 'GET',
  description:
    '[Feishu/Lark]-Docs-Sheets-Data-Read multiple ranges-Read cell values from multiple specified ranges in a spreadsheet',
  accessTokens: ['tenant', 'user'],
  schema: {
    params: z.object({
      ranges: z.string().describe('Multiple ranges separated by comma, e.g., sheet_id!A1:B2,sheet_id!C3:D4'),
      valueRenderOption: z
        .enum(['ToString', 'Formula', 'FormattedValue', 'UnformattedValue'])
        .describe('How values should be rendered')
        .optional(),
      dateTimeRenderOption: z
        .enum(['FormattedString', 'SerialNumber'])
        .describe('How dates should be rendered')
        .optional(),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('Spreadsheet token from the URL or API'),
    }),
    useUAT: z.boolean().describe('Use user access token, otherwise use tenant access token').optional(),
  },
};

/**
 * Write to a single range of cells
 * PUT /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values
 */
export const sheetsV2SpreadsheetValuesUpdate = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.update',
  sdkName: 'sheets.v2.spreadsheetValues.update',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values',
  httpMethod: 'PUT',
  description:
    '[Feishu/Lark]-Docs-Sheets-Data-Write to a single range-Write values to a specified range in a spreadsheet. Values will overwrite existing data',
  accessTokens: ['tenant', 'user'],
  schema: {
    data: z.object({
      valueRange: z.object({
        range: z.string().describe('Range to write, format: sheet_id!A1:B2'),
        values: z
          .array(z.array(z.any()))
          .describe('2D array of values to write, each inner array is a row'),
      }),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('Spreadsheet token from the URL or API'),
    }),
    useUAT: z.boolean().describe('Use user access token, otherwise use tenant access token').optional(),
  },
};

/**
 * Write to multiple ranges of cells
 * POST /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_batch_update
 */
export const sheetsV2SpreadsheetValuesBatchUpdate = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.batchUpdate',
  sdkName: 'sheets.v2.spreadsheetValues.batchUpdate',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_batch_update',
  httpMethod: 'POST',
  description:
    '[Feishu/Lark]-Docs-Sheets-Data-Write to multiple ranges-Write values to multiple specified ranges in a spreadsheet',
  accessTokens: ['tenant', 'user'],
  schema: {
    data: z.object({
      valueRanges: z.array(
        z.object({
          range: z.string().describe('Range to write, format: sheet_id!A1:B2'),
          values: z
            .array(z.array(z.any()))
            .describe('2D array of values to write'),
        })
      ),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('Spreadsheet token from the URL or API'),
    }),
    useUAT: z.boolean().describe('Use user access token, otherwise use tenant access token').optional(),
  },
};

/**
 * Append data after existing content
 * POST /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_append
 */
export const sheetsV2SpreadsheetValuesAppend = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.append',
  sdkName: 'sheets.v2.spreadsheetValues.append',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_append',
  httpMethod: 'POST',
  description:
    '[Feishu/Lark]-Docs-Sheets-Data-Append data-Append values after the last row with data in the specified range',
  accessTokens: ['tenant', 'user'],
  schema: {
    params: z
      .object({
        insertDataOption: z
          .enum(['OVERWRITE', 'INSERT_ROWS'])
          .describe('How data should be inserted. OVERWRITE overwrites, INSERT_ROWS inserts new rows')
          .optional(),
      })
      .optional(),
    data: z.object({
      valueRange: z.object({
        range: z.string().describe('Range where data will be appended, format: sheet_id!A1:B2'),
        values: z
          .array(z.array(z.any()))
          .describe('2D array of values to append'),
      }),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('Spreadsheet token from the URL or API'),
    }),
    useUAT: z.boolean().describe('Use user access token, otherwise use tenant access token').optional(),
  },
};

/**
 * Insert rows or columns
 * POST /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/dimension_range
 */
export const sheetsV2SpreadsheetDimensionRangeInsert = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetDimensionRange.insert',
  sdkName: 'sheets.v2.spreadsheetDimensionRange.insert',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/dimension_range',
  httpMethod: 'POST',
  description:
    '[Feishu/Lark]-Docs-Sheets-Row-Column-Insert rows or columns-Insert empty rows or columns at the specified position in a sheet',
  accessTokens: ['tenant', 'user'],
  schema: {
    data: z.object({
      dimension: z.object({
        sheetId: z.string().describe('Sheet ID where rows/columns will be inserted'),
        majorDimension: z.enum(['ROWS', 'COLUMNS']).describe('Whether to insert ROWS or COLUMNS'),
        startIndex: z.number().describe('Start index (0-based) for insertion'),
        length: z.number().describe('Number of rows/columns to insert'),
      }),
      inheritStyle: z
        .enum(['BEFORE', 'AFTER'])
        .describe('Inherit style from BEFORE or AFTER the insertion point')
        .optional(),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('Spreadsheet token from the URL or API'),
    }),
    useUAT: z.boolean().describe('Use user access token, otherwise use tenant access token').optional(),
  },
};

/**
 * Delete rows or columns
 * DELETE /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/dimension_range
 */
export const sheetsV2SpreadsheetDimensionRangeDelete = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetDimensionRange.delete',
  sdkName: 'sheets.v2.spreadsheetDimensionRange.delete',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/dimension_range',
  httpMethod: 'DELETE',
  description:
    '[Feishu/Lark]-Docs-Sheets-Row-Column-Delete rows or columns-Delete rows or columns at the specified position in a sheet',
  accessTokens: ['tenant', 'user'],
  schema: {
    data: z.object({
      dimension: z.object({
        sheetId: z.string().describe('Sheet ID where rows/columns will be deleted'),
        majorDimension: z.enum(['ROWS', 'COLUMNS']).describe('Whether to delete ROWS or COLUMNS'),
        startIndex: z.number().describe('Start index (0-based, inclusive) for deletion'),
        endIndex: z.number().describe('End index (0-based, inclusive) for deletion. Deletes rows/columns from startIndex to endIndex (both inclusive)'),
      }),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('Spreadsheet token from the URL or API'),
    }),
    useUAT: z.boolean().describe('Use user access token, otherwise use tenant access token').optional(),
  },
};

export const sheetsV2ToolName: sheetsV2ToolName[] = [
  'sheets.v2.spreadsheetValues.get',
  'sheets.v2.spreadsheetValues.batchGet',
  'sheets.v2.spreadsheetValues.update',
  'sheets.v2.spreadsheetValues.batchUpdate',
  'sheets.v2.spreadsheetValues.append',
  'sheets.v2.spreadsheetDimensionRange.insert',
  'sheets.v2.spreadsheetDimensionRange.delete',
];

export const sheetsV2Tools = [
  sheetsV2SpreadsheetValuesGet,
  sheetsV2SpreadsheetValuesBatchGet,
  sheetsV2SpreadsheetValuesUpdate,
  sheetsV2SpreadsheetValuesBatchUpdate,
  sheetsV2SpreadsheetValuesAppend,
  sheetsV2SpreadsheetDimensionRangeInsert,
  sheetsV2SpreadsheetDimensionRangeDelete,
];
