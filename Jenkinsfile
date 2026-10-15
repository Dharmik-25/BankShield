pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Source') {
            steps {
                sh '''
                    set -e
                    test -f backend/app.py
                    test -f backend/Dockerfile
                    test -f frontend/package.json
                    test -f frontend/Dockerfile
                    echo "Source verification passed"
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    set -e
                    python3 -m venv /tmp/bankshield-venv
                    /tmp/bankshield-venv/bin/pip install -r backend/requirements.txt
                    cd backend
                    /tmp/bankshield-venv/bin/python -m unittest discover -p "test_backend.py" -v
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                sh '''
                    set -e
                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    set -e
                    docker build -t bankshield-backend:ci backend
                    docker build -t bankshield-frontend:ci frontend
                '''
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    set -e
                    trivy image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 bankshield-backend:ci
                    trivy image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 bankshield-frontend:ci
                    echo "Both Docker images passed Trivy security scanning"
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                sh '''
                    set -e
                    docker image inspect bankshield-backend:ci > /dev/null
                    docker image inspect bankshield-frontend:ci > /dev/null
                    echo "Docker images built and verified"
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: BankShield CI pipeline passed.'
        }
        failure {
            echo 'FAILED: Check console output.'
        }
    }
}
