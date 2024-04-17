import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelCommandInput } from "@aws-sdk/client-bedrock-runtime";
import { Handler } from "aws-lambda";

const contentType = 'application/json';
const rockerRuntimeClient = new BedrockRuntimeClient({region: process.env.REGION});

export const handler: Handler = async (event, context) => {

    const badResponse = {
        statusCode: 400,
        headers: {
            'Content-Type': `${contentType}`,
        },
        body: JSON.stringify('Invalid request.  Ask me a question!')
    }

    if (event.body && event.body !== "") {
        let body = JSON.parse(event.body);
        if (body.question && body.question !== "") {
            let question = body.question;

            const modelId = process.env.MODEL_ID;

            const inputCommand: InvokeModelCommandInput = { 
                modelId,
                contentType,
                accept: contentType,
                body: JSON.stringify({
                    text_prompts: [
                        {'text': question, 'weight': 1}
                    ],
                    'style_preset': 'photographic',
                })
            }
            
            const command = new InvokeModelCommand(inputCommand);
            const response = await rockerRuntimeClient.send(command);
            
            const jsonData = JSON.parse(new TextDecoder().decode(response.body));
            const image = jsonData.artifacts[0].base64;

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': `${contentType}`,
                },
                body: image
            }
        } else {
            return badResponse;
        }
    } else {
        return badResponse;
    }
}