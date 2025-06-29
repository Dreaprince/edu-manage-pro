import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';



@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: "ssdhfjgkuhjkldfcgh", // Ensure you have an API key in .env
    });
  }

  // Course Recommendation based on student interests
  async recommendCourses(interests: string[]): Promise<any> {
    const prompt = `Recommend some university courses based on these interests: ${interests.join(', ')}`;

    try {
      const response = await this.openai.completions.create({
        model: 'text-davinci-003', // Or another model, depending on your API version
        prompt,
        max_tokens: 100,
      });
      return response.choices[0].text.trim();
    } catch (error) {
      console.error('Error in course recommendation:', error);
      throw new Error('Failed to generate course recommendations');
    }
  }

  // Syllabus generation based on topic
  async generateSyllabus(topic: string): Promise<any> {
    const prompt = `Generate a detailed syllabus for a course on the topic: ${topic}`;

    try {
      const response = await this.openai.completions.create({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 300,
      });
      return response.choices[0].text.trim();
    } catch (error) {
      console.error('Error in syllabus generation:', error);
      throw new Error('Failed to generate syllabus');
    }
  }
}
