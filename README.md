# Example for S3 Archive with replications

> Create an Amazon S3 Bucket in your desired region and enable bucket replication for backups.

## Architecture

* CloudFormation Stack with S3 Bucket, KMS, and StackSet
* CloudFormation StackSet for S3 regional replication

## Usage

### Prerequisite

To use self-managed StackSets, you need to [create two IAM roles](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-prereqs-self-managed.html) first. You can create them manually using the AWS Management Console or use the official CloudFormation templates provided by AWS:

- [AWSCloudFormationStackSetAdministrationRole.yml](https://s3.amazonaws.com/cloudformation-stackset-sample-templates-us-east-1/AWSCloudFormationStackSetAdministrationRole.yml)
- [AWSCloudFormationStackSetExecutionRole.yml](https://s3.amazonaws.com/cloudformation-stackset-sample-templates-us-east-1/AWSCloudFormationStackSetExecutionRole.yml)

### Configuration

Check `aws/index.ts` to configure your archive and replication:

```js
const prefix = 'example'
const option = {
  prefix,
  env: {
    account: '123456789000',
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
