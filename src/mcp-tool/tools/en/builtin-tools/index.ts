import { docxBuiltinToolName, docxBuiltinTools } from './docx/builtin';
import { driveBuiltinToolName, driveBuiltinTools } from './drive/builtin';
import { imBuiltinToolName, imBuiltinTools } from './im/buildin';

export const BuiltinTools = [...docxBuiltinTools, ...driveBuiltinTools, ...imBuiltinTools];

export type BuiltinToolName = docxBuiltinToolName | driveBuiltinToolName | imBuiltinToolName;
