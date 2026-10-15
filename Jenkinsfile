pipeline { agent any

options { timestamps() skipDefaultCheckout(true) }

stages { stage('Checkout') { steps { checkout scm } }

stage('Verify Source') { steps { sh ''' test -f backend/app.py test -f backend/Dockerfile test -f frontend/package.json test -f frontend/Dockerfile echo "Source verification passed" ''' } }

stage('Backend Tests') { steps { sh ''' python3 -m venv /tmp/bankshield-venv /tmp/bankshield-venv/bin/pip install -r backend/requirements.txt cd backend /tmp/bankshield-venv/bin/python -m unittest discover -p "test_backend.py" -v ''' } }

stage('Frontend Build') { steps { sh ''' cd frontend npm ci npm run build ''' } }

stage('Docker Build') { steps { sh ''' docker build -t bankshield-backend:ci backend docker build -t bankshield-frontend:ci frontend ''' } }

stage('Trivy Security Scan') { steps { sh ''' trivy image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 bankshield-backend:ci trivy image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 bankshield-frontend:ci echo "Both Docker images passed Trivy security scanning" ''' } }

stage('Deployment Verification') { steps { sh ''' docker image inspect bankshield-backend:ci docker image inspect bankshield-frontend:ci echo "Docker images built and verified" ''' } } }

post { success { echo 'SUCCESS: BankShield CI pipeline passed.' } failure { echo 'FAILED: Check console output.' } } }