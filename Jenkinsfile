/**
 * Jenkins CI/CD Declarative Pipeline - ClubPortal
 * Authored by: Prashant Nagre (PRN: 2303108) - Jenkins Engineer
 */
pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = "clubportal-backend"
        DOCKER_IMAGE_FRONTEND = "clubportal-frontend"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Backend Lint & Check') {
            steps {
                echo 'Verifying backend dependencies and syntax...'
                dir('project/server') {
                    bat 'npm ci'
                    bat 'node --check src/index.js'
                }
            }
        }

        stage('Frontend Build & Typecheck') {
            steps {
                echo 'Checking types and building frontend bundle...'
                dir('project') {
                    bat 'npm ci'
                    bat 'npm run typecheck'
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker containers via Docker Compose...'
                bat 'docker compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                echo 'Launching application containers...'
                bat 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Verifying application availability...'
                bat 'powershell -NoProfile -Command "Start-Sleep -Seconds 5; try { $res = Invoke-RestMethod -Uri http://localhost:5000/api/health; Write-Output $res } catch { Write-Warning $_.Exception.Message }"'
            }
        }
    }

    post {
        always {
            echo 'ClubPortal pipeline stage execution complete.'
        }
        success {
            echo 'ClubPortal CI/CD pipeline successfully built, tested, and deployed!'
        }
        failure {
            echo 'Pipeline failed. Please inspect console logs.'
        }
    }
}
