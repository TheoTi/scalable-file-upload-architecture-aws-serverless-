# Scalable Architecture for Large File Uploads with AWS and Serverless

This project implements a robust and scalable solution for uploading large files (up to 2TB) using AWS S3's Multipart Upload approach. The architecture integrates technologies like ReactJS, Vite, TailwindCSS, Lambda Functions, SQS, and DynamoDB, ensuring high resilience, resource optimization, and complete monitoring.

The solution processes uploads in small chunks, enabling control and recovery in case of failures, along with detailed validation for CSV data. The entire infrastructure is provisioned using the Serverless Framework, simplifying deployment and reducing operational costs.

Ideal for scenarios where stability and efficiency in data processing are critical. 🚀

---

### Tools Used

<p align="left">
<a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/typescript-colored.svg" width="36" height="36" alt="TypeScript" /></a>
<a href="https://git-scm.com/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/git-colored.svg" width="36" height="36" alt="Git" /></a>
<a href="https://code.visualstudio.com/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/visualstudiocode.svg" width="36" height="36" alt="VS Code" /></a>
<a href="https://reactjs.org/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/react-colored.svg" width="36" height="36" alt="React" /></a>
<a href="https://tailwindcss.com/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/tailwindcss-colored.svg" width="36" height="36" alt="TailwindCSS" /></a>
<a href="https://vitejs.dev/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/vite-colored.svg" width="36" height="36" alt="Vite" /></a>
<a href="https://nodejs.org/en/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/nodejs-colored.svg" width="36" height="36" alt="NodeJS" /></a>
<a href="https://aws.amazon.com" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/aws-colored.svg" width="36" height="36" alt="Amazon Web Services" /></a>
<a href="https://www.linux.org" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/linux-colored.svg" width="36" height="36" alt="Linux" /></a>
</p>

---

### Social Media

<p align="left">
<a href="https://www.github.com/theoti" target="_blank" rel="noreferrer">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/github-dark.svg" />
<source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/github.svg" />
<img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/github.svg" width="32" height="32" />
</picture>
</a>
<a href="https://www.linkedin.com/in/matheus-fernandes-14919118a" target="_blank" rel="noreferrer">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/linkedin-dark.svg" />
<source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/linkedin.svg" />
<img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/socials/linkedin.svg" width="32" height="32" />
</picture>
</a>
</p>

---

# The Problem  

The main challenge is handling **large file uploads** (files exceeding gigabytes). Network instabilities are common during browsing. Imagine uploading a 5 GB file, only to lose the progress when the connection fails at 99.9%. The entire process is lost, and the server may crash or waste memory and CPU resources handling such uploads until they complete or fail.

If the upload is done via a browser and the server uses `node:fs` to process the file, the entire file must be loaded into memory before being sent to storage services like S3 or GCP Storage. This requires configuring the server to support high memory loads, which can be cumbersome.

---

# The Solution  

Instead of uploading a large file all at once, it can be divided into smaller chunks and uploaded in parts. While this may seem complex initially, it solves the problem by controlling the upload progress.

With **AWS S3's Multipart Upload**, the file is split into parts and each part is uploaded individually. This process generates a signed URL (*Presigned URL*) and an upload ID (*UploadId*). S3 waits for all chunks to be uploaded, and once completed, a function must be invoked to finalize the Multipart Upload. If any part fails, only the failed chunks need to be reuploaded.

This approach supports uploads of up to **2 TB** with specific limitations:  
- Minimum chunk size: 5 MB (except the last);  
- Maximum file size: 2 TB;  
- Maximum 10,000 chunks per MPU.  

---

## Frontend  

The frontend is a simple application built with `ReactJS`, `Vite`, `TailwindCSS`, and `Shadcn/UI`. It has a single screen for uploading `.CSV` files.  

---

## Backend  

Most of the solution lies in the backend, designed according to the following system architecture:  
![Design System](https://personaltheobucket.s3.sa-east-1.amazonaws.com/Captura+de+tela+de+2024-12-11+11-40-47.png)  

The structure uses **Lambda functions**, queues (**SQS**), **S3**, and **DynamoDB** to manage chunk uploads. Here's how it works:  
1. From a client action, the Multipart Upload is initiated.  
2. Automatic events trigger, and files uploaded to the bucket activate a Lambda.  
3. The Lambda reads the file chunks and sends messages to the SQS queue containing information like the object key, chunk byte range, and data read.  

The data is also logged in DynamoDB for tracking, with an initial status of 'pending'. A second Lambda processes these messages, validates the data (e.g., CPF, CNPJ, and values), and saves consolidated information in another table.  

Finally, the DynamoDB status is updated to 'completed'. If any chunk fails, it can be reuploaded.  

The entire infrastructure is built with **Serverless** (Infrastructure as Code). Simply configure the **AWS CLI** with your credentials and run the `sls deploy` command to provision resources automatically.  

The bucket includes lifecycle rules to:  
- Remove incomplete Multipart Uploads after 1 day;  
- Delete stored files after 1 day, avoiding unnecessary costs.  

---

# Note  

When testing the application, update the frontend URLs for the `abortMPU`, `completeMPU`, and `initiateMPU` services, as these change with each new deployment.  

I hope this solution is positively evaluated and that these details are well understood.  

Warm regards,  
Matheus.  