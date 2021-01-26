import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as kms from '@aws-cdk/aws-kms'
import * as cdk from '@aws-cdk/core'

export class DriveStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const key = new kms.Key(this, 'Key')
    const alias = key.addAlias('drive')

    const bucket = new s3.Bucket(this, 'Storage', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: alias,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketKeyEnabled: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    })

    const user = new iam.User(this, 'Access', {})
    const accessKey = new iam.CfnAccessKey(this, 'AccessKey', {
      userName: user.userName,
    })

    key.grantDecrypt(user)
    key.grantEncrypt(user)

    bucket.grantDelete(user)
    bucket.grantRead(user)
    bucket.grantWrite(user)

    // new cdk.CfnOutput(this, 'DriveStorage', { value: bucket.bucketName })
    // new cdk.CfnOutput(this, 'UserAccessKey', { value: accessKey.ref })
    // new cdk.CfnOutput(this, 'UserSecretAccessKey', { value: accessKey.attrSecretAccessKey })
  }
}
