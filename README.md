# Event-Driven Agent Demo

This is the repo for the demo in *Towards Cognitive Agent: Beyond Q&A: Build Event-Driven Agents with Streaming Database*


## Quick Start

*This Demo supports `HTTPS_PROXY`, if you have trouble accessing the LLM provider, please set the `HTTPS_PROXY` environment variable. For more details, check `lib/proxiedFetch.js`.*

1. Set the API KEY of your AI model.

    ```shell
    export OPENAI_API_KEY=your-api-key
    export MY_MODEL=openai:gpt-3.5-turbo
    ```

Supported providers:
 - [x] Groq
 - [x] Cohere
 - [x] xAI
 - [x] Mistral
 - [x] Fireworks
 - [x] OpenAI

Use `MY_MODEL=provider:model` to select the AI model. 
For example, to select `llama3-70b-8192` in Groq, use `MY_MODEL=groq:llama3-70b-8192`.
For more details, check the `lib/models.js` file.

2. Start risingwave in one TTY 1.

    ```shell
    # Install RisingWave in your local machine
    curl https://risingwave.com/sh | bash
    # Start RisingWave
    ./risingwave
    ```

3. Run the project in another TTY 2.

    ```shell
    pnpm run dev
    ```

4. Open the browser and go to `http://localhost:3001`.

5. Chat with the Agent:

    ```
    🤔: Create table `login_events`, columns are nanoid, email, timestamp.
    🤔: Tell me when @example.com folks login.
    🤔: Insert some data to login_events that will trigger the event listener.
    ```
