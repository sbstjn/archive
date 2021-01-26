#!/usr/bin/env node

import * as cdk from '@aws-cdk/core'
import { DriveStack } from './stacks/drive'

const app = new cdk.App()

new DriveStack(app, 'Drive')
