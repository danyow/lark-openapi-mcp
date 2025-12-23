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
 * 读取单个范围
 * GET /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values/:range
 */
export const sheetsV2SpreadsheetValuesGet = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.get',
  sdkName: 'sheets.v2.spreadsheetValues.get',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values/:range',
  httpMethod: 'GET',
  description:
    '[飞书]-云文档-电子表格-数据操作-读取单个范围-从电子表格的指定范围读取单元格的值。范围格式为 sheet_id!A1:B2 或仅 A1:B2（默认第一个工作表）',
  accessTokens: ['tenant', 'user'],
  schema: {
    params: z
      .object({
        valueRenderOption: z
          .enum(['ToString', 'Formula', 'FormattedValue', 'UnformattedValue'])
          .describe('值的渲染方式，默认为 ToString')
          .optional(),
        dateTimeRenderOption: z
          .enum(['FormattedString', 'SerialNumber'])
          .describe('日期的渲染方式，默认为 FormattedString')
          .optional(),
      })
      .optional(),
    path: z.object({
      spreadsheet_token: z.string().describe('电子表格的 token，可从 URL 或 API 获取'),
      range: z.string().describe('读取范围，格式：sheet_id!A1:B2 或 A1:B2'),
    }),
    useUAT: z.boolean().describe('使用用户访问令牌，否则使用租户访问令牌').optional(),
  },
};

/**
 * 读取多个范围
 * GET /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_batch_get
 */
export const sheetsV2SpreadsheetValuesBatchGet = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.batchGet',
  sdkName: 'sheets.v2.spreadsheetValues.batchGet',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_batch_get',
  httpMethod: 'GET',
  description:
    '[飞书]-云文档-电子表格-数据操作-读取多个范围-从电子表格的多个指定范围读取单元格的值',
  accessTokens: ['tenant', 'user'],
  schema: {
    params: z.object({
      ranges: z.string().describe('多个范围，用逗号分隔，例如：sheet_id!A1:B2,sheet_id!C3:D4'),
      valueRenderOption: z
        .enum(['ToString', 'Formula', 'FormattedValue', 'UnformattedValue'])
        .describe('值的渲染方式')
        .optional(),
      dateTimeRenderOption: z
        .enum(['FormattedString', 'SerialNumber'])
        .describe('日期的渲染方式')
        .optional(),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('电子表格的 token'),
    }),
    useUAT: z.boolean().describe('使用用户访问令牌，否则使用租户访问令牌').optional(),
  },
};

/**
 * 写入单个范围
 * PUT /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values
 */
export const sheetsV2SpreadsheetValuesUpdate = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.update',
  sdkName: 'sheets.v2.spreadsheetValues.update',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values',
  httpMethod: 'PUT',
  description:
    '[飞书]-云文档-电子表格-数据操作-写入单个范围-向电子表格的指定范围写入值，会覆盖现有数据',
  accessTokens: ['tenant', 'user'],
  schema: {
    data: z.object({
      valueRange: z.object({
        range: z.string().describe('写入范围，格式：sheet_id!A1:B2'),
        values: z
          .array(z.array(z.any()))
          .describe('要写入的二维数组，每个内部数组代表一行'),
      }),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('电子表格的 token'),
    }),
    useUAT: z.boolean().describe('使用用户访问令牌，否则使用租户访问令牌').optional(),
  },
};

/**
 * 写入多个范围
 * POST /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_batch_update
 */
export const sheetsV2SpreadsheetValuesBatchUpdate = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.batchUpdate',
  sdkName: 'sheets.v2.spreadsheetValues.batchUpdate',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_batch_update',
  httpMethod: 'POST',
  description:
    '[飞书]-云文档-电子表格-数据操作-写入多个范围-向电子表格的多个指定范围写入值',
  accessTokens: ['tenant', 'user'],
  schema: {
    data: z.object({
      valueRanges: z.array(
        z.object({
          range: z.string().describe('写入范围，格式：sheet_id!A1:B2'),
          values: z
            .array(z.array(z.any()))
            .describe('要写入的二维数组'),
        })
      ),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('电子表格的 token'),
    }),
    useUAT: z.boolean().describe('使用用户访问令牌，否则使用租户访问令牌').optional(),
  },
};

/**
 * 追加数据
 * POST /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_append
 */
export const sheetsV2SpreadsheetValuesAppend = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetValues.append',
  sdkName: 'sheets.v2.spreadsheetValues.append',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values_append',
  httpMethod: 'POST',
  description:
    '[飞书]-云文档-电子表格-数据操作-追加数据-在指定范围的最后一行有数据的位置之后追加值',
  accessTokens: ['tenant', 'user'],
  schema: {
    params: z
      .object({
        insertDataOption: z
          .enum(['OVERWRITE', 'INSERT_ROWS'])
          .describe('数据插入方式。OVERWRITE 覆盖，INSERT_ROWS 插入新行')
          .optional(),
      })
      .optional(),
    data: z.object({
      valueRange: z.object({
        range: z.string().describe('追加数据的范围，格式：sheet_id!A1:B2'),
        values: z
          .array(z.array(z.any()))
          .describe('要追加的二维数组'),
      }),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('电子表格的 token'),
    }),
    useUAT: z.boolean().describe('使用用户访问令牌，否则使用租户访问令牌').optional(),
  },
};

/**
 * 插入行或列
 * POST /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/insert_dimension_range
 */
export const sheetsV2SpreadsheetDimensionRangeInsert = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetDimensionRange.insert',
  sdkName: 'sheets.v2.spreadsheetDimensionRange.insert',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/insert_dimension_range',
  httpMethod: 'POST',
  description:
    '[飞书]-云文档-电子表格-行列操作-插入行或列-在工作表的指定位置插入空行或空列',
  accessTokens: ['tenant', 'user'],
  schema: {
    data: z.object({
      dimension: z.object({
        sheetId: z.string().describe('要插入行/列的工作表 ID'),
        majorDimension: z.enum(['ROWS', 'COLUMNS']).describe('插入行还是列'),
        startIndex: z.number().describe('插入的起始索引（从0开始，包含）'),
        endIndex: z.number().describe('插入的结束索引（从0开始，不包含）。插入 (endIndex - startIndex) 行/列'),
      }),
      inheritStyle: z
        .enum(['BEFORE', 'AFTER'])
        .describe('从插入点的 BEFORE（前面）还是 AFTER（后面）继承样式')
        .optional(),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('电子表格的 token'),
    }),
    useUAT: z.boolean().describe('使用用户访问令牌，否则使用租户访问令牌').optional(),
  },
};

/**
 * 删除行或列
 * DELETE /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/dimension_range
 */
export const sheetsV2SpreadsheetDimensionRangeDelete = {
  project: 'sheets',
  name: 'sheets.v2.spreadsheetDimensionRange.delete',
  sdkName: 'sheets.v2.spreadsheetDimensionRange.delete',
  path: '/open-apis/sheets/v2/spreadsheets/:spreadsheet_token/dimension_range',
  httpMethod: 'DELETE',
  description:
    '[飞书]-云文档-电子表格-行列操作-删除行或列-删除工作表中指定位置的行或列',
  accessTokens: ['tenant', 'user'],
  schema: {
    data: z.object({
      dimension: z.object({
        sheetId: z.string().describe('要删除行/列的工作表 ID'),
        majorDimension: z.enum(['ROWS', 'COLUMNS']).describe('删除行还是列'),
        startIndex: z.number().describe('删除的起始索引（从0开始，包含）'),
        endIndex: z.number().describe('删除的结束索引（从0开始，包含）。删除从 startIndex 到 endIndex 的所有行/列（两端都包含）'),
      }),
    }),
    path: z.object({
      spreadsheet_token: z.string().describe('电子表格的 token'),
    }),
    useUAT: z.boolean().describe('使用用户访问令牌，否则使用租户访问令牌').optional(),
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
