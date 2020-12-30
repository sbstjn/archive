import { expect as expectCDK, haveResource } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'

import * as Example from '../../../aws/stacks/example'

test('SQS Queue Created', () => {
  const app = new cdk.App()
  const stack = new Example.ExampleStack(app, 'MyTestStack')

  expectCDK(stack).to(haveResource("AWS::SQS::Queue", {
    VisibilityTimeout: 300
  }))
})

test('SNS Topic Created', () => {
  const app = new cdk.App()
  const stack = new Example.ExampleStack(app, 'MyTestStack')

  expectCDK(stack).to(haveResource("AWS::SNS::Topic"))
})

test('Lambda Function Created', () => {
  const app = new cdk.App()
  const stack = new Example.ExampleStack(app, 'MyTestStack')

  expectCDK(stack).to(haveResource("AWS::Lambda::Function"))
})
