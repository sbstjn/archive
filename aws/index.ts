#!/usr/bin/env node

import * as cdk from '@aws-cdk/core'

import { ArchiveStack } from './stacks/archive'

const prefix = 'sbstjn'
const option = {
  prefix,
  env: {
    region: 'eu-central-1'
  },
  replications: [
    'eu-west-1',
    'eu-north-1'
  ]
}

const app = new cdk.App()

new ArchiveStack(app, 'Archive', {
  stackName: `${prefix}-archive`,
  ...option
})
