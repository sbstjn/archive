#!/usr/bin/env node

import * as cdk from '@aws-cdk/core'
import { ExampleStack } from './stacks/example'

const app = new cdk.App()

new ExampleStack(app, 'Example', {
  env: {
    region: 'eu-central-1'
  }
})
