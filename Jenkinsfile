
pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
    }

    environment {
        DB_HOST = '127.0.0.1'
        DB_PORT = '3306'
        DB_NAME = 'loan_management'
    }

    stages {

        stage('Install dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Run API tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'api-base-url', variable: 'BASE_URL'),

                    usernamePassword(
                        credentialsId: 'api-credentials',
                        usernameVariable: 'API_USERNAME',
                        passwordVariable: 'API_PASSWORD'
                    ),

                    string(credentialsId: 'DB_USER', variable: 'DB_USER'),

                    string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD')
                ]) {
                    script {
                        if (isUnix()) {
                            sh '''
                                echo Checking database configuration...
                                test -n "$DB_USER" && echo DB_USER configured || echo DB_USER missing
                                test -n "$DB_PASSWORD" && echo DB_PASSWORD configured || echo DB_PASSWORD missing
                                npm run test:loan
                            '''
                        } else {
                            bat '''
                                echo Checking database configuration...
                                if not "%DB_USER%"=="" (echo DB_USER configured) else (echo DB_USER missing)
                                if not "%DB_PASSWORD%"=="" (echo DB_PASSWORD configured) else (echo DB_PASSWORD missing)
                                echo DB_HOST=%DB_HOST%
                                echo DB_PORT=%DB_PORT%
                                call npm run test:loan
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts(
                artifacts: 'playwright-report/**',
                allowEmptyArchive: true
            )
        }
    }
}
