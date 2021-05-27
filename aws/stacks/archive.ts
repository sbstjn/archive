import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as kms from '@aws-cdk/aws-kms'
import * as cdk from '@aws-cdk/core'

import * as fs from 'fs'
import * as path from 'path'

export interface ArchiveProps extends cdk.StackProps {
  prefix: string
  replications: string[]
}

const templateReplicationFile = path.resolve(__dirname, '../templates/replication.yml')
const templateReplicationData = fs.readFileSync(templateReplicationFile).toString()

export class ArchiveStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ArchiveProps) {
    super(scope, id, props)

    const key = new kms.Key(this, 'Key')
    const alias = key.addAlias('archive')

    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: `${props.prefix}-archive`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: alias,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketKeyEnabled: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    })

    new cdk.CfnStackSet(this, "StackSet", {
      stackSetName: `${props.prefix}-archive-replication`,
      permissionModel: "SELF_MANAGED",
      parameters: [
        {
          parameterKey: 'Prefix',
          parameterValue: props.prefix
        }
      ],
      stackInstancesGroup: [
        {
          regions: props.replications,
          deploymentTargets: {
            accounts: [this.account],
          },
        },
      ],
      templateBody:templateReplicationData,
    });
    

    // const role = new iam.Role(this, 'ReplicationRole', {
    //   assumedBy: new iam.ServicePrincipal('s3.amazonaws.com'),
    //   path: '/service-role/'
    // });

    // role.addToPolicy(new iam.PolicyStatement({
    //   resources: [bucket.bucketArn],
    //   actions: ['s3:GetReplicationConfiguration', 's3:ListBucket'] }));

    // role.addToPolicy(new iam.PolicyStatement({
    //   resources: [bucket.arnForObjects('*')],
    //   actions: ['s3:GetObjectVersion', 's3:GetObjectVersionAcl', 's3:GetObjectVersionForReplication', 's3:GetObjectLegalHold', 's3:GetObjectVersionTagging', 's3:GetObjectRetention'] }));

    // role.addToPolicy(new iam.PolicyStatement({
    //   resources: [props.bucket.arnForObjects('*')],
    //   actions: ['s3:ReplicateObject', 's3:ReplicateDelete', 's3:ReplicateTags', 's3:GetObjectVersionTagging'] }));

    // role.addToPolicy(new iam.PolicyStatement({
    //   resources: [key.keyArn],
    //   actions: ['kms:Decrypt'] }));

    // role.addToPolicy(new iam.PolicyStatement({
    //   resources: [props.key.keyArn],
    //   actions: ['kms:Encrypt'] }));

    // Get the AWS CloudFormation resource
    // const cfnBucket = bucket.node.defaultChild as s3.CfnBucket;

    // // Change its properties
    // cfnBucket.replicationConfiguration = {
    //   role: role.roleArn,
    //   rules: [{
    //     destination: {
    //       bucket: props.bucket.bucketArn,
    //       encryptionConfiguration: {
    //         replicaKmsKeyId: props.key.keyArn
    //       }
    //     },
    //     sourceSelectionCriteria: {
    //       sseKmsEncryptedObjects: {
    //         status: 'Enabled'
    //       }
    //     },
    //     status: 'Enabled'
    //   }]
    // }

    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName })
    new cdk.CfnOutput(this, 'BucketRegion', { value: this.region })
    new cdk.CfnOutput(this, 'BucketReplications', { value: props.replications.join(', ') })
  }
}
