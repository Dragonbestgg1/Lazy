// File: app/api/evaluate/route.ts
import { NextResponse } from 'next/server';
import { GPT4All } from 'gpt4all';

// Initialize GPT4All with your downloaded model file.
// Update the model path to the correct location.
const gpt4all = new GPT4All({
  model: 'models/gpt4all.bin'  // Change this to your model file path
});

// Listen for model readiness and errors.
gpt4all.on('ready', () => {
  console.log('GPT4All model is ready to process requests.');
});

gpt4all.on('error', (error: Error) => {
  console.error('GPT4All encountered an error:', error);
});

// POST route to process evaluation requests.
export async function POST(request: Request) {
  try {
    // Parse the JSON body.
    const { requirements } = await request.json();
    if (!requirements) {
      return NextResponse.json(
        { error: 'Missing "requirements" in request body.' },
        { status: 400 }
      );
    }

    // Construct a prompt for GPT4All.
    const prompt = `Please evaluate the following requirements:\n\n${requirements}\n\nProvide a detailed analysis:`;

    // Query the GPT4All model.
    const result = await gpt4all.query(prompt);

    // Return the GPT4All output as the evaluation result.
    return NextResponse.json({ result });
  } catch (err) {
    console.error('Error during evaluation:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
