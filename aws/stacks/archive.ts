import * as s3 from 'aws-cdk-lib/aws-s3'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as kms from 'aws-cdk-lib/aws-kms'
import * as cdk from 'aws-cdk-lib';

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

    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        resources: [
          bucket.bucketArn
        ],
        actions: [
          's3:DeleteBucket'
        ],
        principals: [
          new iam.AnyPrincipal()
        ]
      })
    )

    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        resources: [
          bucket.arnForObjects('*')
        ],
        actions: [
          's3:DeleteObjectVersion'
        ],
        principals: [
          new iam.AnyPrincipal()
        ]
      })
    )

    const role = new iam.Role(this, 'ReplicationRole', {
      assumedBy: new iam.ServicePrincipal('s3.amazonaws.com'),
      path: '/service-role/'
    });

    const stackSet = new cdk.CfnStackSet(this, "StackSet", {
      stackSetName: `${props.prefix}-archive-replication`,
      permissionModel: "SELF_MANAGED",
      parameters: [
        {
          parameterKey: 'Prefix',
          parameterValue: props.prefix
        },
        {
          parameterKey: 'ReplicationRole',
          parameterValue: role.roleArn
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

    role.addToPolicy(
      new iam.PolicyStatement({
        resources: [
          bucket.bucketArn
        ],
        actions: [
          's3:GetReplicationConfiguration',
          's3:ListBucket'
        ]
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        resources: [
          bucket.arnForObjects('*')
        ],
        actions: [
          's3:GetObjectVersion',
          's3:GetObjectVersionAcl',
          's3:GetObjectVersionForReplication',
          's3:GetObjectVersionTagging'
        ]
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        resources: [
          key.keyArn
        ],
        actions: [
          'kms:Decrypt'
        ]
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        resources: props.replications.map(
          region => `arn:aws:kms:${region}:${this.account}:alias/archive/replication`
        ),
        actions: [
          'kms:Encrypt'
        ]
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        resources: props.replications.map(
          region => `arn:aws:s3:::${props.prefix}-archive-replication-${region}/*`
        ),
        actions: [
          's3:ReplicateDelete',
          's3:ReplicateObject',
          's3:ReplicateTags'
        ]
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        resources: props.replications.map(
          region => `arn:aws:s3:::${props.prefix}-archive-replication-${region}`
        ),
        actions: [
          's3:List*',
          's3:GetBucketVersioning',
          's3:PutBucketVersioning'
        ]
      })
    );

    const cfnBucket = bucket.node.defaultChild as s3.CfnBucket;

    // Change its properties
    cfnBucket.replicationConfiguration = {
      role: role.roleArn,
      rules: props.replications.map(
        (region, index) => (
          {
            id: region,
            destination: {
              bucket: `arn:aws:s3:::${props.prefix}-archive-replication-${region}`,
              encryptionConfiguration: {
                replicaKmsKeyId: `arn:aws:kms:${region}:${this.account}:alias/archive/replication`
              }
            },
            priority: index,
            deleteMarkerReplication: {
              status: 'Enabled'
            },
            filter: {
              prefix: ''
            },
            sourceSelectionCriteria: {
              sseKmsEncryptedObjects: {
                status: 'Enabled'
              }
            },
            status: 'Enabled'
          }
        )
      )
    }
    cfnBucket.addDependsOn(stackSet);
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName })
    new cdk.CfnOutput(this, 'BucketRegion', { value: this.region })
    new cdk.CfnOutput(this, 'BucketReplications', { value: props.replications.join(', ') })
  }
}
