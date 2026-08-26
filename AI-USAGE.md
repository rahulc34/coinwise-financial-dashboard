# AI Usage Disclosure

## Tools used

I used ChatGPT as an AI-assisted development and review tool while completing this assignment.

## How AI was used

AI assistance was used for:

- Discussing frontend and backend architecture.
- Generating initial implementation scaffolding.
- Reviewing PostgreSQL schema and indexing decisions.
- Designing data-normalization rules for the supplied transaction dataset.
- Debugging timestamp-format, module-import, TypeScript-build, deployment-path, and API-prefix issues.
- Reviewing accessibility considerations for the transaction table and modal.
- Drafting and refining project documentation.

## Areas that received AI assistance

AI-assisted suggestions were used across parts of:

- FastAPI route, service, repository, and schema organization.
- Reward redemption validation and transaction handling.
- React component organization.
- Recharts category analytics.
- README, assumptions, decisions, and deployment documentation.

## My responsibility and verification

I reviewed and adapted the suggested code before including it in the project.

I was responsible for:

- Interpreting the assignment requirements.
- Making the final product and technical decisions.
- Inspecting irregularities in the supplied dataset.
- Configuring the local PostgreSQL database.
- Running and debugging the seed process.
- Integrating the frontend, backend, and database.
- Testing the application locally.
- Deploying PostgreSQL, FastAPI, and the Vite frontend.
- Verifying the deployed functionality.
- Deciding what to include and what to leave unfinished.

AI-generated suggestions were not accepted blindly. They were tested, corrected, and adjusted to match the actual project structure and data.

## Example AI-assisted discussions

Examples of questions and tasks discussed with AI include:

- How should duplicate external transaction IDs be stored without losing records?
- How should mixed timestamp formats be normalized before PostgreSQL insertion?
- How should negative successful transactions be represented and handled for rewards?
- How should server-side filtering, sorting, and pagination be structured safely?
- How can reward redemption prevent concurrent overspending?
- How should optimistic balance updates roll back after a failed request?
- How should a keyboard-accessible transaction modal manage focus?
- How should a Vite frontend and FastAPI backend be configured for deployment?

## Limitations

AI was used as an implementation assistant, not as an autonomous submission author. The final integration, testing, deployment, and submission decisions were completed and verified by me.
