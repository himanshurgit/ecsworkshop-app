# ecsworkshop-app

Objective: 
Set up the ecsworkshop-app repository with a working HTML/CSS/JS frontend (served by Nginx) and a Node.js/Express backend, packaged as Docker images (frontend-latest, backend-latest) for deployment to AWS ECS. The frontend serves a static page and proxies /api/ requests to the backend’s /api/health endpoint. The setup includes a GitHub Actions workflow to build, test, and push images to the single ECR repository (my-app-repo) in ecsworkshop-infra.

Directory Structure:
ecsworkshop-app/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── Dockerfile
│   ├── .dockerignore
├── .github/
│   ├── workflows/
│       ├── deploy.yml

App Components:

1. Frontend: Nginx serves static HTML/CSS/JS files, proxies /api/ to backend:3000 (resolved by ECS service discovery).
2. Backend: Node.js/Express server with CORS, serving /api/health on port 3000.
3. Workflow: GitHub Actions workflow (deploy.yml) to build, test, and push Docker images to ECR, then update ECS services to DesiredCount: 1.
4. ECR: Single repository (my-app-repo) in ecsworkshop-infra, with tags frontend-latest and backend-latest.
5. ECS: Assumes ecs-network-stack and ecs-app-stack are deployed in ecsworkshop-infra, with frontend-service and backend-service initially at DesiredCount: 0.

Prerequisites:

Local Environment:
1. Docker installed and running.
2. AWS CLI configured with credentials for us-east-1.
3. Git installed.

AWS Setup:
1. ecsworkshop-infra repository deployed with ecs-network-stack and ecs-app-stack (via templates/network-stack.cf.yml and ecs-stack.cf.yml).
2. ECR repository my-app-repo created in AWS account 140955125134.
3. GitHub secrets set in ecsworkshop-app:
    AWS_ACCOUNT_ID:
    AWS_ACCESS_KEY_ID.
    AWS_SECRET_ACCESS_KEY.

Git Setup:
1. Create a repo in github with name ecsworkshop-app
2. Clone the repo into the local system


Below is a list of all libraries and tools required locally to run the `ecsworkshop-app` plan, including their installation commands and purposes. This focuses solely on the dependencies needed for the frontend and backend, as well as tools for building and testing the application locally. No application code is included, as requested.

---

### Libraries and Tools

1. **Docker**
   - **Purpose**: Builds, runs, and manages Docker containers for frontend (Nginx) and backend (Node.js) locally.
   - **Installation Command**:
     ```bash
     # On macOS (using Homebrew)
     brew install docker
     # On Ubuntu
     sudo apt-get update
     sudo apt-get install -y docker.io
     sudo systemctl start docker
     sudo systemctl enable docker
     ```
   - **Note**: Ensure Docker Desktop is running on macOS/Windows, or the Docker daemon is active on Linux.

2. **Node.js (includes npm)**
   - **Purpose**: Required for backend development and testing, to install dependencies (`express`, `cors`) and run the backend locally outside Docker (optional).
   - **Installation Command**:
     ```bash
     # On macOS (using Homebrew)
     brew install node
     # On Ubuntu
     sudo apt-get update
     sudo apt-get install -y nodejs npm
     ```
   - **Note**: Use Node.js v18 to match the `node:18-alpine` Docker image.

3. **express**
   - **Purpose**: Backend web framework for Node.js, used to create the REST API (`/api/health`) in `backend/index.js`.
   - **Installation Command**:
     ```bash
     cd ~/ecs-workshop/ecsworkshop-app/backend
     npm install express@^4.18.2
     ```

4. **cors**
   - **Purpose**: Middleware for Express to enable Cross-Origin Resource Sharing, allowing the frontend to make requests to the backend.
   - **Installation Command**:
     ```bash
     cd ~/ecs-workshop/ecsworkshop-app/backend
     npm install cors@^2.8.5
     ```

5. **AWS CLI**
   - **Purpose**: Interacts with AWS services (ECR, ECS, CloudFormation) to verify infrastructure and deployment.
   - **Installation Command**:
     ```bash
     # On macOS (using Homebrew)
     brew install awscli
     # On Ubuntu
     curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
     unzip awscliv2.zip
     sudo ./aws/install
     ```
   - **Note**: Configure with `aws configure` using your AWS credentials.

6. **Git**
   - **Purpose**: Version control to clone the repository and manage code changes.
   - **Installation Command**:
     ```bash
     # On macOS (using Homebrew)
     brew install git
     # On Ubuntu
     sudo apt-get update
     sudo apt-get install -y git
     ```

7. **yamllint** (Optional)
   - **Purpose**: Validates the YAML syntax of `deploy.yml` to ensure the GitHub Actions workflow is correct.
   - **Installation Command**:
     ```bash
     # On macOS (using Homebrew)
     brew install yamllint
     # On Ubuntu
     sudo apt-get update
     sudo apt-get install -y yamllint
     ```

---

### Notes
- **Backend Dependencies**: `express` and `cors` are installed in the Docker image via `backend/Dockerfile` (`RUN npm install`), but local installation is needed only for non-Docker testing or development.
- **No Frontend Libraries**: The frontend uses static HTML/CSS/JS served by Nginx, requiring no additional libraries beyond Docker.
- **Verification**: Ensure all tools are installed by running:
  ```bash
  docker --version
  node --version
  npm --version
  aws --version
  git --version
  yamllint --version
  ```
- **Context**: These libraries/tools support the `ecsworkshop-app` plan for local testing and preparation for ECS deployment, as validated in our prior discussions (e.g., April 19, 2025).

Let me know if you need clarification or additional tools for your documentation, and confirm when you’re ready for the deployment steps!




## Testing frontend and Backend locally:

In Order to Test locally, follow below Steps:
1. Rename nginx.conf file in frontend directory to nginx.conf.local
2. Update below code for backend within nginx.conf.local file to locate backend service locally.
  # Proxy API requests to backend
    location /api/ {
    #   proxy_pass http://backend:3000; # ECS resolves backend service
        proxy_pass http://host.docker.internal:3000; # Local backend
3. Update the nginx file name in Dockerfiile within frontend directory-
    # Copy Nginx config
    COPY nginx.conf.local /etc/nginx/conf.d/default.conf
4. Run following command to build the image and container for frontend-
    >docker build -t test-frontend .
    >docker run -d -p 8080:80 --name frontend test-frontend
5. Test the frontend using curl or paste the url in browser. Expected result is html page with backend status "Error" since backend is not configured currently.
    >curl http://localhost:8080
6. Run following command to build the image and container for backend-
    > docker build -t test-backend .
    >docker run -d -p 3000:3000 --name backend test-backend
7. Test the backend using curl or check the frontend url, backend status should be 'OK'.
    > curl http://localhost:3000/api/health
8. Stop the container in the docker desktop
9. Revert the nginx.conf.local name back to nginx.conf
10. Revert the url in nginx.conf file
     # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:3000; # ECS resolves backend service
     #   proxy_pass http://host.docker.internal:3000; # Local backend
11. Update the dockerfile in frontend directory-
     # Copy Nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
12. Now you should be good to deploy the code to ECS.




