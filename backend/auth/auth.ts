import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as bcrypt from 'bcryptjs';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME || 'Users';
const saltRounds = 10;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const path = event.path;
    const method = event.httpMethod;
    
    try {
        if (path === '/register' && method === 'POST') {
            return await handleRegister(event);
        } else if (path === '/login' && method === 'POST') {
            return await handleLogin(event);
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Not Found' })
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};

async function handleRegister(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { email, password } = JSON.parse(event.body || '{}');
    
    if (!email || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Email and password are required' })
        };
    }

    // Check if user already exists
    const getCommand = new GetCommand({
        TableName: tableName,
        Key: { email }
    });

    const existingUser = await docClient.send(getCommand);

    if (existingUser.Item) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'User already exists' })
        };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user to DynamoDB
    const putCommand = new PutCommand({
        TableName: tableName,
        Item: {
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        }
    });

    await docClient.send(putCommand);

    return {
        statusCode: 201,
        body: JSON.stringify({ message: 'User registered successfully' })
    };
}

async function handleLogin(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { email, password } = JSON.parse(event.body || '{}');
    
    if (!email || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Email and password are required' })
        };
    }

    // Get user from DynamoDB
    const getCommand = new GetCommand({
        TableName: tableName,
        Key: { email }
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Invalid credentials' })
        };
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, result.Item.password);

    if (!passwordMatch) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Invalid credentials' })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Login successful' })
    };
}