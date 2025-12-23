import * as lark from '@larksuiteoapi/node-sdk';
import { McpHandler, McpHandlerOptions } from '../types';
import { logger } from '../../utils/logger';

/**
 * Replace path parameters in URL template
 * e.g., /open-apis/sheets/v2/spreadsheets/:spreadsheet_token/values/:range
 * with pathParams { spreadsheet_token: "xxx", range: "yyy" }
 * becomes /open-apis/sheets/v2/spreadsheets/xxx/values/yyy
 */
const fillApiPath = (apiPath: string, pathParams: Record<string, string> = {}): string => {
  return apiPath.replace(/:([^/]+)/g, (_, key) => {
    if (pathParams[key] !== undefined) {
      return encodeURIComponent(pathParams[key]);
    }
    throw new Error(`Missing path parameter: ${key}`);
  });
};

const sdkFuncCall = async (client: lark.Client, params: any, options: McpHandlerOptions) => {
  const { tool, userAccessToken } = options || {};
  const { sdkName, path, httpMethod } = tool || {};

  if (!sdkName) {
    logger.error(`[larkOapiHandler] Invalid sdkName`);
    throw new Error('Invalid sdkName');
  }

  if (!path) {
    logger.error(`[larkOapiHandler] Invalid path`);
    throw new Error('Invalid path');
  }

  const chain = sdkName.split('.');
  let func: any = client;
  for (const element of chain) {
    func = func[element as keyof typeof func];
    if (!func) {
      // SDK doesn't have this method, use client.request() with path parameter replacement
      func = async (reqParams: any, ...args: any) => {
        const { path: pathParams, ...restParams } = reqParams || {};
        const filledPath = fillApiPath(path, pathParams);
        return await client.request({ method: httpMethod, url: filledPath, ...restParams }, ...args);
      };
      break;
    }
  }
  if (!(func instanceof Function)) {
    func = async (reqParams: any, ...args: any) => {
      const { path: pathParams, ...restParams } = reqParams || {};
      const filledPath = fillApiPath(path, pathParams);
      return await client.request({ method: httpMethod, url: filledPath, ...restParams }, ...args);
    };
  }

  if (params?.useUAT) {
    if (!userAccessToken) {
      logger.error(`[larkOapiHandler] UserAccessToken is invalid or expired`);
      throw new Error('UserAccessToken is invalid or expired');
    }
    return await func(params, lark.withUserAccessToken(userAccessToken));
  }
  return await func(params);
};

export const larkOapiHandler: McpHandler = async (client, params, options) => {
  try {
    const response = await sdkFuncCall(client, params, options);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(response?.data ?? response),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify((error as any)?.response?.data || (error as any)?.message || error),
        },
      ],
    };
  }
};
