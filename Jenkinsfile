pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Source') {
            steps {
                sh '''
                    echo "BankShield DevSecOps CI/CD"
                    ls -la
                    test -f backend/app.py
                    test -f frontend/package.json
                    test -f backend/Dockerfile
                    test -f frontend/Dockerfile
                '''
            }
        }

        stage('Python Syntax Check') {
            steps {
                sh '''
                    python3 -m py_compile backend/app.py backend/database.py backend/risk_engine.py backend/test_backend.py
                '''
            }
        }

        stage('Backend Unit Tests') {
            steps {
                sh '''
                    cd backend
                    python3 -m unittest discover -p "test_backend.py" -v
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                sh '''
                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Deployment') {
            steps {
                echo 'BankShield passed the automated build and test stages.'
            }
        }
    }

    post {
        success {
            echo 'BankShield CI/CD pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the console output.'
        }
    }
}
