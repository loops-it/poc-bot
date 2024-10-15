import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// Generate chunk ID
export const generateChatId = (): string => {
  const currentDate = new Date();
  const prefix = "Chunk";
  const formattedDate = currentDate.toISOString().replace(/[-:.]/g, "");
  return `${prefix}_${formattedDate}`;
};

// // split into chunks
// const splitTextIntoChunks = (text: string, chunkSize: number): string[] => {
//   const chunks: string[] = [];
//   let start = 0;

//   while (start < text.length) {
//     let end = Math.min(start + chunkSize, text.length);
//     if (end < text.length && text[end] !== " " && text[end] !== "\n") {
//       end = text.lastIndexOf(" ", end) || end;
//     }
//     chunks.push(text.slice(start, end).trim());
//     start = end;
//   }

//   return chunks;
// };

// // embedd and upsert
// export const processAndUpsertText = async (
//   text: string,
//   title: string,
//   category: string,
//   chunkSize: number = 1536
// ): Promise<void> => {

//   console.log("title: ", title)
//   console.log("category: ", category)
//   console.log("text: ", text)
//   // const chunks = splitTextIntoChunks(text, chunkSize);

//   const docId = generateDocumentId();

//   // for (const chunk of chunks) {
//     try {
//       const response = await openai.embeddings.create({
//         model: "text-embedding-ada-002",
//         input: text,
//       });

//       const uniqueId = generateChatId();
//       const embeddings = response.data[0].embedding;

//       console.log("embeddings: ",embeddings)

//       // Upsert the chunk into Pinecone
//       await index.namespace(namespaceName).upsert([
//         {
//           id: uniqueId,
//           values: embeddings,
//           metadata: {
//             docId: docId,
//             title: title,
//             category: category.toLowerCase().trim(),
//             text: text,
//           },
//         },
//       ]);

//       console.log(`Chunk with ID ${uniqueId} upserted successfully.`);
//     } catch (error) {
//       console.error("Error processing chunk:", error);
//       throw new Error(`Failed to process chunk: ${error}`);
//     }
//   // }
// };

// // pinecone data upsert
// export const upsertDocument = async (
//   id: string,
//   values: number[],
//   metadata: { [key: string]: any }
// ): Promise<void> => {
//   try {
//     const pineconeNamespace = index.namespace(namespaceName);

//     await pineconeNamespace.upsert([
//       {
//         id: id,
//         values: values,
//         metadata: metadata,
//       },
//     ]);

//     console.log(`Document with ID ${id} upserted successfully.`);
//   } catch (error) {
//     console.error("Error upserting document:", error);
//     throw new Error(`Failed to upsert document: ${error}`);
//   }
// };

// // open ai embeddings
// export const generateEmbeddings = async (text: string): Promise<number[]> => {
//   try {
//     const response = await openai.embeddings.create({
//       model: "text-embedding-ada-002",
//       input: text,
//     });

//     return response.data[0].embedding;
//   } catch (error) {
//     console.error("Error generating embeddings:", error);
//     throw new Error(`Failed to generate embeddings: ${error}`);
//   }
// };

// interface RecordMetadata {
//   title?: string;
//   category?: string;
//   text?: string;
//   author?: string;
//   publishedYear?: string;
//   docId?: string;
// }

// // generate context
// export const generateContext = async (
//   completionQuestion: string
// ): Promise<{ titles: { id: string; title: string; docId: string }[] }> => {
//   const embedding = await openai.embeddings.create({
//     model: "text-embedding-ada-002",
//     input: completionQuestion,
//   });

//   const namespace = index.namespace(namespaceName);

//   const queryResponse = await namespace.query({
//     vector: embedding.data[0].embedding,
//     topK: 5,
//     includeMetadata: true,
//   });

//   const titlesMap = new Map<string, string>();

//   queryResponse.matches.forEach((match) => {
//     const metadata = match.metadata as RecordMetadata;
//     if (metadata.title && metadata.docId) {
//       titlesMap.set(metadata.title, metadata.docId);
//     }
//   });


//   const titlesArrayWithCategory = queryResponse.matches
//     .map((match) => {
//       const metadata = match.metadata as RecordMetadata;
//       return `${metadata.category ?? "N/A"} \n`;
//     })
//     .join("\n");
//   console.log("Categories : ", titlesArrayWithCategory)


//   const titlesArray = Array.from(titlesMap.entries()).map(([title, docId], index) => ({
//     id: `title-${index}`,
//     title: title,
//     docId: docId
//   }));

//   return { titles: titlesArray };
// };

// export const generateContextAndAnswer = async (
//   userQuestion: string
// ): Promise<string> => {
//   const embedding = await openai.embeddings.create({
//     model: "text-embedding-ada-002",
//     input: userQuestion,
//   });

//   const namespace = index.namespace(namespaceName);


//   const queryResponse = await namespace.query({
//     vector: embedding.data[0].embedding,
//     topK: 3,
//     includeMetadata: true,
//   });


//   const titlesArray = queryResponse.matches
//     .map((match) => {
//       const metadata = match.metadata as RecordMetadata;
//       return `${metadata.text ?? "N/A"} \n`;
//     })
//     .join("\n");

//   const titlesArrayFiltered = queryResponse.matches
//     .map((match) => {
//       const metadata = match.metadata as RecordMetadata;
//       return `${metadata.category ?? "N/A"} \n`;
//     })
//     .join("\n");
//   console.log("category array : ", titlesArrayFiltered)
//   return titlesArray;
// };

// // open ai search
// export const searchQueryOpenAI = async (
//   question: string,
//   titles: string,
// ): Promise<string> => {
//   try {

//     const context = `
//     ${titles}`

//     const generateAnswerPrompt = `
//       Based on the provided context, answer the following question as accurately as possible. Do not include information that is not present in the context.
//       ----------
//       CONTEXT:
//       ${context}
//       ----------
//       QUESTION:
//       ${question}
//       ----------
//       Answer:
//     `;

//     const completionQuestion = await openai.completions.create({
//       model: "gpt-3.5-turbo-instruct",
//       prompt: generateAnswerPrompt,
//       max_tokens: 150,
//       temperature: 0,
//     });
//     // console.log(
//     //   "Answer : ",
//     //   completionQuestion.choices[0].text.trim()
//     // );
//     let results = completionQuestion.choices[0].text.trim();

//     return results;
//   } catch (error) {
//     console.error("Error generating embeddings:", error);
//     throw new Error(`Failed to generate embeddings: ${error}`);
//   }
// };
