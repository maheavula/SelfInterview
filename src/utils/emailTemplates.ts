export const getFeedbackEmailTemplate = (feedbackData: any) => {
  const {
    interviewExperience,
    aiQuestionQuality,
    userInterface,
    overallSatisfaction,
    experienceText,
    userEmail,
    timestamp
  } = feedbackData;

  const getStarRating = (rating: number) => {
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    return stars;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#10B981'; // green
    if (rating >= 3) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Feedback Received - SelfInterview AI+</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .section-title::before {
            content: '';
            width: 4px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin-right: 10px;
            border-radius: 2px;
        }
        
        .rating-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .rating-item {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        
        .rating-label {
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 8px;
        }
        
        .rating-stars {
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .rating-score {
            font-size: 14px;
            color: #718096;
        }
        
        .feedback-text {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            margin-bottom: 20px;
        }
        
        .feedback-label {
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 10px;
        }
        
        .feedback-content {
            color: #4a5568;
            line-height: 1.6;
        }
        
        .user-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .user-info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .user-info-label {
            font-weight: 600;
            opacity: 0.9;
        }
        
        .user-info-value {
            opacity: 0.9;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            color: #718096;
            font-size: 14px;
        }
        
        .highlight {
            color: #667eea;
            font-weight: 600;
        }
        
        @media (max-width: 600px) {
            .rating-grid {
                grid-template-columns: 1fr;
            }
            
            .content {
                padding: 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">SelfInterview AI+</div>
            <div class="subtitle">New User Feedback Received</div>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">📊 User Ratings</div>
                <div class="rating-grid">
                    <div class="rating-item">
                        <div class="rating-label">Interview Experience</div>
                        <div class="rating-stars">${getStarRating(interviewExperience)}</div>
                        <div class="rating-score">${interviewExperience}/5 stars</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-label">AI Question Quality</div>
                        <div class="rating-stars">${getStarRating(aiQuestionQuality)}</div>
                        <div class="rating-score">${aiQuestionQuality}/5 stars</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-label">User Interface</div>
                        <div class="rating-stars">${getStarRating(userInterface)}</div>
                        <div class="rating-score">${userInterface}/5 stars</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-label">Overall Satisfaction</div>
                        <div class="rating-stars">${getStarRating(overallSatisfaction)}</div>
                        <div class="rating-score">${overallSatisfaction}/5 stars</div>
                    </div>
                </div>
            </div>
            
            ${experienceText ? `
            <div class="section">
                <div class="section-title">💬 User Experience</div>
                <div class="feedback-text">
                    <div class="feedback-content">${experienceText}</div>
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-title">👤 User Information</div>
                <div class="user-info">
                    <div class="user-info-item">
                        <span class="user-info-label">User Email:</span>
                        <span class="user-info-value">${userEmail || 'Anonymous'}</span>
                    </div>
                    <div class="user-info-item">
                        <span class="user-info-label">Submission Time:</span>
                        <span class="user-info-value">${new Date(timestamp).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                This feedback was submitted through the <span class="highlight">SelfInterview AI+</span> platform.<br>
                Thank you for helping us improve our service!
            </div>
        </div>
    </div>
</body>
</html>
  `;
}; 