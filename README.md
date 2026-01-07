<img width="1918" height="1078" alt="perlinUI" src="https://github.com/user-attachments/assets/902145e2-e1af-4112-b2dd-403b5313294a" />

# Understanding the Emotions of Media: A Live Visualization of Global News
A live visualization of emotions detected in news article from around the world, with user controlled visual parameters. Built in p5.js, using NewsAPI.ai and J. Hartmann's " Emotion English DistilRoBERTa-base" emotion detection model.

# Getting Started
## Prerequisites
- p5.js
- Python 3.10 or later
- API key from [newsapi.ai](https://newsapi.ai/)
- Hartmann's [Emotion English DistilRoBERTa-base](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base)

## Installation
1. Download code
2. Replace insert your API key at line 1 of apiCalls.js
3. Run emotion_detector_hf
4. Start the p5.js sketch, for example through a VS Code live server

# Using the application
After some time loading, the visualization will appear. Each cluster of colored articles represents the emotions detected in a recently published news article. Depending on performance and frequency of news articles at the time of running, the visualization will usually have between a two and five minute delay. A button in the top right corner toggles the UI, which features a legend for the colors, and basic controls for adjusting the visualization.

# License
This project is available under the MIT License. See the [LICENSE](https://github.com/florett1/Emotions-of-Media/blob/main/LICENSE) file for details.

# Acknowledgements
This project was developed as part of the course "Computational Design Laboratory" at the University of Coimbra. Thank you to the professors for their advice and supervision, and thank you to the university for my Erasmus.

This project uses the [newsapi.ai](https://newsapi.ai/) API for gathering live news and Hartmann's [Emotion English DistilRoBERTa-base](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base) for emotion detection. Thank you to the respective developers of these tools.
