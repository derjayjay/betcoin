import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import pino, { Logger } from 'pino';

import { BaseEntity } from '../models/base.model';
import config from '../utils/config';

export class Repository {
  private dynameDB: DynamoDBDocument;
  private readonly tableName: string;
  protected readonly logger: Logger<never>;

  protected constructor(tableName?: string, loggerName?: string) {
    this.tableName = tableName ?? config.DYNAMODB_TABLE_NAME;
    this.dynameDB = DynamoDBDocument.from(
      new DynamoDB({
        region: config.DYNAMODB_AWS_REGION,
        endpoint: config.DYNAMODB_ENDPOINT,
        credentials: {
          accessKeyId: config.DYNAMODB_ACCESS_KEY_ID,
          secretAccessKey: config.DYNAMODB_SECRET_ACCESS_KEY,
        },
      })
    );

    this.logger = pino({ name: `${config.SERVER_NAME} - ${loggerName ?? 'Repository'}`, level: config.LOG_LEVEL });
  }

  protected async get<T extends BaseEntity>(pk: string, sk: string): Promise<T | undefined> {
    const params = {
      TableName: this.tableName,
      Key: {
        pk,
        sk,
      },
    };

    try {
      const result = await this.dynameDB.get(params);
      return result.Item as T;
    } catch (error) {
      this.logger.error(error, `Failed to retrieve item ${pk}#${sk}`);
      return undefined;
    }
  }

  protected async put<T extends BaseEntity>(item: T): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Item: item,
    };

    try {
      await this.dynameDB.put(params);
      return true;
    } catch (error) {
      this.logger.error(error, `Failed to put item ${JSON.stringify(item)}`);
      return false;
    }
  }

  protected async putMany<T extends BaseEntity>(...args: Array<T>): Promise<boolean> {
    if (args.length < 1) {
      return false;
    }

    const params = {
      TransactItems: args.map((item) => ({
        Put: {
          TableName: this.tableName,
          Item: item,
        },
      })),
    };

    try {
      await this.dynameDB.transactWrite(params);
      return true;
    } catch (error) {
      this.logger.error(error, `Failed to put items ${JSON.stringify(args)}.`);
      return false;
    }
  }

  protected async putAndUpdate<T1 extends BaseEntity, T2 extends BaseEntity>(
    putItem: T1,
    updateItem: { pk: string; sk: string; records: Partial<T2> }
  ): Promise<boolean> {
    const writeRequests = [
      {
        Put: {
          TableName: this.tableName,
          Item: putItem,
        },
      },
      {
        Update: {
          TableName: this.tableName,
          Key: {
            pk: updateItem.pk,
            sk: updateItem.sk,
          },
          UpdateExpression: this.createUpdateExpression(updateItem.records),
          ExpressionAttributeValues: this.createExpressionAttributeValues(updateItem.records),
          ExpressionAttributeNames: this.createExpressionAttributeNames(updateItem.records),
        },
      },
    ];

    const params = {
      TransactItems: writeRequests,
    };

    try {
      await this.dynameDB.transactWrite(params);
      return true;
    } catch (error) {
      this.logger.error(
        error,
        `Failed to put item ${JSON.stringify(putItem)} and update item ${JSON.stringify(updateItem)}`
      );
      return false;
    }
  }

  protected async query<T extends BaseEntity>(
    pk: string,
    sk: string,
    attributes?: { [key: string]: any }
  ): Promise<T[] | undefined> {
    let FilterExpression = {};
    const ExpressionAttributeNames: { [key: string]: string } = {
      '#pk': 'pk',
      '#sk': 'sk',
    };
    const ExpressionAttributeValues: { [key: string]: any } = {
      ':pk': pk,
      ':sk': sk,
    };

    if (attributes && Object.keys(attributes).length > 0) {
      const filterParts: string[] = [];
      for (const [attribute, value] of Object.entries(attributes)) {
        ExpressionAttributeNames[`#${attribute}`] = attribute;
        ExpressionAttributeValues[`:${attribute}`] = value;
        filterParts.push(`#${attribute} = :${attribute}`);
      }

      FilterExpression = { FilterExpression: filterParts.join(' and ') };
    }
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
      ExpressionAttributeValues: ExpressionAttributeValues,
      ExpressionAttributeNames: ExpressionAttributeNames,
      ...FilterExpression,
    };

    try {
      const result = await this.dynameDB.query(params);
      return result.Items as T[];
    } catch (error) {
      this.logger.error(error, `Query ${params.KeyConditionExpression} failed`);
      return undefined;
    }
  }

  protected async update<T extends BaseEntity>(pk: string, sk: string, records: Partial<T>): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: {
        pk: pk,
        sk: sk,
      },
      UpdateExpression: this.createUpdateExpression(records),
      ExpressionAttributeValues: this.createExpressionAttributeValues(records),
      ExpressionAttributeNames: this.createExpressionAttributeNames(records),
    };

    try {
      await this.dynameDB.update(params);
      return true;
    } catch (error) {
      this.logger.error(error, `Failed to update item ${pk}#${sk} with values ${JSON.stringify(records)}`);
      return false;
    }
  }

  protected async updateMany<T extends BaseEntity>(
    ...args: Array<{ pk: string; sk: string; records: Partial<T> }>
  ): Promise<boolean> {
    if (args.length < 1) {
      return false;
    }

    const params = {
      TransactItems: args.map((item) => ({
        Update: {
          TableName: this.tableName,
          Key: {
            pk: item.pk,
            sk: item.sk,
          },
          UpdateExpression: this.createUpdateExpression(item.records),
          ExpressionAttributeValues: this.createExpressionAttributeValues(item.records),
          ExpressionAttributeNames: this.createExpressionAttributeNames(item.records),
        },
      })),
    };

    try {
      await this.dynameDB.transactWrite(params);
      return true;
    } catch (error) {
      this.logger.error(error, `Failed to update items ${JSON.stringify(args)}.`);
      return false;
    }
  }

  protected async delete(pk: string, sk: string): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: {
        pk,
        sk,
      },
    };

    try {
      await this.dynameDB.delete(params);
      return true;
    } catch (error) {
      this.logger.error(error, `Failed to delete item ${pk}#${sk}`);
      return false;
    }
  }

  private createUpdateExpression(records: Record<string, any>): string {
    const updateExpressionParts: string[] = [];
    for (const [attribute] of Object.entries(records)) {
      updateExpressionParts.push(`#${attribute} = :${attribute}`);
    }
    return `SET ${updateExpressionParts.join(', ')}`;
  }

  private createExpressionAttributeValues(records: Record<string, any>): Record<string, any> {
    const expressionAttributeValues: Record<string, any> = {};
    for (const [attribute, value] of Object.entries(records)) {
      expressionAttributeValues[`:${attribute}`] = value;
    }
    return expressionAttributeValues;
  }

  private createExpressionAttributeNames(records: Record<string, any>): Record<string, string> {
    const expressionAttributeNames: Record<string, string> = {};
    for (const [attribute] of Object.entries(records)) {
      expressionAttributeNames[`#${attribute}`] = attribute;
    }
    return expressionAttributeNames;
  }
}
