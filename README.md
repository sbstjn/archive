# S3 Archive with Regional Replications

[![MIT License](https://badgen.now.sh/badge/License/MIT/blue)](https://github.com/sbstjn/archive/blob/master/LICENSE.md)
[![sbstjn.com](https://badgen.now.sh/badge/Read/Blog%20Post/purple)](https://sbstjn.com/blog/aws-cdk-s3-bucket-reginal-replication-kms/)

> Use the AWS Cloud Development Kit to deploy an Amazon S3 Bucket in your desired region and enable regional bucket replications for backups.

## Architecture

* CloudFormation Stack with S3 Bucket, KMS, and StackSet
* CloudFormation StackSet for S3 regional replication

## Usage

### Prerequisites

To use self-managed StackSets, you need to [create two IAM roles](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-prereqs-self-managed.html) first. You can create them manually using the AWS Management Console or use the official CloudFormation templates provided by AWS:

- [AWSCloudFormationStackSetAdministrationRole.yml](https://s3.amazonaws.com/cloudformation-stackset-sample-templates-us-east-1/AWSCloudFormationStackSetAdministrationRole.yml)
- [AWSCloudFormationStackSetExecutionRole.yml](https://s3.amazonaws.com/cloudformation-stackset-sample-templates-us-east-1/AWSCloudFormationStackSetExecutionRole.yml)

### Configuration

Modify `aws/index.ts` to configure your archive and replication:

```js
const prefix = 'example'
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
```

### Deployment

```bash
# Deploy CloudFormation Stack with CDK

$ > npx cdk deploy

[…]

Outputs:
Archive.BucketName = example-archive
Archive.BucketRegion = eu-central-1
Archive.BucketReplications = eu-west-1, eu-north-1

```
