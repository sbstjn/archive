import * as sns from '@aws-cdk/aws-sns'
import * as subs from '@aws-cdk/aws-sns-subscriptions'
import * as lambda from '@aws-cdk/aws-lambda-nodejs'
import * as sqs from '@aws-cdk/aws-sqs'
import * as cdk from '@aws-cdk/core'

export class ExampleStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const queue = new sqs.Queue(this, 'ExampleQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    })

    const topic = new sns.Topic(this, 'ExampleTopic')

    topic.addSubscription(
      new subs.SqsSubscription(queue)
    )

    const func = new lambda.NodejsFunction(this, 'ExampleFunction', {
      entry: 'src/lambda/handler.ts',
      handler: 'run'
    })

    topic.grantPublish(func)
  }
}
