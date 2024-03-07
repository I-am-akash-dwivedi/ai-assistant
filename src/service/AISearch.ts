"use server";

import saveData from "@/lib/google_sheets";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function answerQuestion(question: string) {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant. You will be given a question you have to answer the question as best as you can. Try to be short and concise. Explain in very simple words like I am 5.'
            },
            { 
                role: 'user',
                content: `My question is: ${question} (Note: Answer the quesiton in the simplest way possible, and to the point answer. Just answer the question as if you are explaining to a 5 year old kid. Do not provide so much details until asked in the question.)`,
            },
        ],
        model: 'gpt-3.5-turbo',
    };
    const startTime = new Date().getTime();
    const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    const endTime = new Date().getTime();
    const answer = chatCompletion.choices[0].message.content;
    let response = {
        question: question,
        answer: answer,
        time_taken: (endTime - startTime) / 1000,
        usage: chatCompletion.usage,
        save_res: null,
        save_time_taken: 0,
    };
    const start_time_save = new Date().getTime();
    const save_res = await saveData(response);
    const end_time_save = new Date().getTime();
    response['save_res'] = save_res;
    response['save_time_taken'] = (end_time_save - start_time_save) / 1000;

    return response;
}