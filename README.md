# ECS Workshop Application

A containerized full-stack web application demonstrating AWS ECS deployment with a React-style frontend and Node.js backend. This application showcases modern containerization practices and automated CI/CD deployment to Amazon Elastic Container Service (ECS).


## 📚 Learning Resources

This project is part of the [**Learn Amazon ECS over a Weekend**](https://shorturl.at/y8ys4) course, which provides comprehensive hands-on experience with containerized applications on AWS.


## 🏗️ Architecture Overview

This application consists of two main components:

- **Frontend**: Static HTML/CSS/JavaScript served by Nginx with API proxy configuration
- **Backend**: Node.js/Express REST API with health check endpoints
- **CI/CD**: GitHub Actions workflow for automated Docker image building and ECS deployment

```
ecsworkshop-app/
├── frontend/
│   ├── index.html          # Main application page
│   ├── style.css           # Application styling
│   ├── script.js           # Frontend JavaScript logic
│   ├── nginx.conf          # Nginx proxy configuration
│   ├── Dockerfile          # Frontend container definition
│   └── .dockerignore       # Docker build exclusions
├── backend/
│   ├── index.js            # Express server with API endpoints
│   ├── package.json        # Node.js dependencies
│   ├── Dockerfile          # Backend container definition
│   └── .dockerignore       # Docker build exclusions
└── .github/
    └── workflows/
        └── deploy.yml      # CI/CD pipeline configuration
```

## 🚀 Application Components

### Frontend Service
- **Technology**: Nginx serving static assets
- **Port**: 80 (containerized), 8080 (local testing)
- **Features**: 
  - Responsive web interface
  - API proxy to backend service
  - ECS service discovery integration

### Backend Service  
- **Technology**: Node.js with Express framework
- **Port**: 3000
- **Endpoints**:
  - `GET /api/health` - Health check endpoint returning service status
- **Features**:
  - CORS enabled for cross-origin requests
  - JSON API responses
  - Container health monitoring

### CI/CD Pipeline
- **Trigger**: Push to main branch
- **Actions**:
  - Build Docker images for frontend and backend
  - Push images to Amazon ECR
  - Update ECS services with new deployments
- **Registry**: Single ECR repository with tagged images (`frontend-latest`, `backend-latest`)

## 📋 Prerequisites

### Local Development Environment
- **Docker**: Container runtime and image building
- **Node.js v18+**: Backend development and testing
- **AWS CLI**: AWS service interaction and authentication
- **Git**: Version control and repository management

### AWS Infrastructure Requirements
- ECS Cluster with network and application stacks deployed
- ECR repository (`my-app-repo`) for container images
- ECS services (`frontend-service`, `backend-service`) configured
- Proper IAM roles and security groups

### GitHub Configuration
Required repository secrets:
- `AWS_ACCOUNT_ID`: Your AWS account identifier
- `AWS_ACCESS_KEY_ID`: AWS access credentials
- `AWS_SECRET_ACCESS_KEY`: AWS secret credentials

## 🛠️ Installation & Setup

### 1. Install Required Tools

**macOS (using Homebrew):**
```bash
brew install docker node aws-cli git
```

**Ubuntu/Debian:**
```bash
# Docker
sudo apt-get update && sudo apt-get install -y docker.io
sudo systemctl start docker && sudo systemctl enable docker

# Node.js
sudo apt-get install -y nodejs npm

# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Git
sudo apt-get install -y git
```

### 2. Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and set region to us-east-1
```

### 3. Verify Installation
```bash
docker --version
node --version
aws --version
git --version
```

## 🧪 Local Development & Testing

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecsworkshop-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Local Testing Process

To test the application locally before ECS deployment:

1. **Prepare frontend for local testing**
   ```bash
   cd frontend
   cp nginx.conf nginx.conf.local
   ```

2. **Update nginx.conf.local for local backend connection**
   ```nginx
   # Proxy API requests to backend
   location /api/ {
       # proxy_pass http://backend:3000; # ECS resolves backend service
       proxy_pass http://host.docker.internal:3000; # Local backend
   }
   ```

3. **Update frontend Dockerfile temporarily**
   ```dockerfile
   # Copy Nginx config
   COPY nginx.conf.local /etc/nginx/conf.d/default.conf
   ```

4. **Build and run frontend container**
   ```bash
   docker build -t test-frontend .
   docker run -d -p 8080:80 --name frontend test-frontend
   ```

5. **Test frontend (backend will show "Error" status initially)**
   ```bash
   curl http://localhost:8080
   # Or visit http://localhost:8080 in your browser
   ```

6. **Build and run backend container**
   ```bash
   cd ../backend
   docker build -t test-backend .
   docker run -d -p 3000:3000 --name backend test-backend
   ```

7. **Verify backend health endpoint**
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"status":"ok"}
   ```

8. **Clean up after testing**
   ```bash
   # Stop containers
   docker stop frontend backend
   docker rm frontend backend
   
   # Revert configuration files
   cd ../frontend
   mv nginx.conf.local nginx.conf
   # Restore original nginx.conf content and Dockerfile
   ```

## 🚢 Deployment

### Automated Deployment
The application automatically deploys to AWS ECS when code is pushed to the main branch. The GitHub Actions workflow:

1. Builds Docker images for both frontend and backend
2. Pushes images to Amazon ECR with appropriate tags
3. Updates ECS services to use the new images
4. Scales services to desired capacity (1 task each)

### Manual Deployment
For manual deployment or troubleshooting:

```bash
# Build images
docker build -t my-app-repo:frontend-latest frontend/
docker build -t my-app-repo:backend-latest backend/

# Tag for ECR
docker tag my-app-repo:frontend-latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/my-app-repo:frontend-latest
docker tag my-app-repo:backend-latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/my-app-repo:backend-latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/my-app-repo:frontend-latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/my-app-repo:backend-latest

# Update ECS services
aws ecs update-service --cluster my-ecs-cluster --service frontend-service --desired-count 1 --region us-east-1
aws ecs update-service --cluster my-ecs-cluster --service backend-service --desired-count 1 --region us-east-1
```

## 🔧 Troubleshooting

### Common Issues
- **Container build failures**: Check Dockerfile syntax and ensure all required files are present
- **ECS service not updating**: Verify ECR repository permissions and ECS task definitions
- **Frontend can't reach backend**: Confirm ECS service discovery configuration and security groups
- **GitHub Actions failing**: Check repository secrets and AWS permissions

### Monitoring
- **ECS Console**: Monitor service health and task status
- **CloudWatch Logs**: View application logs for debugging
- **ECR Console**: Verify image pushes and repository contents


### Infrastructure Setup
To deploy the complete ECS infrastructure stack required for this application, follow the setup instructions in the companion repository: https://github.com/himanshurgit/ecsworkshop-infra.git

The infrastructure repository contains:
- CloudFormation templates for ECS cluster setup
- Network configuration (VPC, subnets, security groups)
- ECR repository creation
- ECS service and task definitions
- Load balancer configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created for educational purposes as part of the ECS Workshop curriculum.