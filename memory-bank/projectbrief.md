# Project Brief: Pandathlon (カス診断)

## Overview

Pandathlon is a web application that enables users to create and share personality quiz/diagnostic tests (診断). The name appears to be a Japanese word play on "quiz" (診断/shindan).

## Core Purpose

Allow users to:

1. Create custom personality quizzes with multiple result types
2. Define quiz parameters (theme, description, question count, result types)
3. Take quizzes and receive personality type results
4. Browse and discover quizzes (hot, recent, favorites)

## Key Requirements

### Quiz Creation

- Users provide:
  - Title/theme for the quiz
  - Description of what the quiz measures
  - Number of questions (1-30)
  - Multiple result types (minimum 2, can add more)
- System generates appropriate questions automatically
- Queue-based processing for quiz generation

### Quiz Taking

- Users answer questions on a 7-point scale (-3 to +3)
- Questions are weighted toward different personality types
- Results calculated based on cumulative scores
- Results include description, strengths, weaknesses, compatibility, and advice

### User Features

- Authentication (login/signup)
- Personal dashboard ("mypage")
- View created quizzes
- Favorite/bookmark quizzes
- Browse public quizzes

## Technical Constraints

- Must be web-based
- Support Japanese language interface
- Handle asynchronous quiz generation
- Maintain scalability for multiple concurrent quiz creations

## Success Criteria

- Users can easily create quizzes without technical knowledge
- Quiz generation is reliable and produces quality results
- Interface is intuitive and responsive
- System handles multiple users efficiently
