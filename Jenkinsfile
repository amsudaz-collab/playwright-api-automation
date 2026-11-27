pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
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
                    )
                ]) {
                    script {
                        if (isUnix()) {
                            sh 'npm run test:loan'
                        } else {
                            bat 'npm run test:loan'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}
