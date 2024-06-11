import path from 'path';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';

// Load all .graphql files from the 'types' directory
const userTypes = loadFilesSync(path.join(__dirname, '../types'), { extensions: ['graphql'] });

// Load all .graphql files from the current directory
const userSchema = loadFilesSync(path.join(__dirname, './'), { extensions: ['graphql'] });

// Merge the loaded type definitions
const typeDefs = mergeTypeDefs([...userTypes, ...userSchema]);

export default typeDefs;
