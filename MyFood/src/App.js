import React, { useState } from 'react';
import Groq from 'groq-sdk';
import './App.css';
import locationIcon from './assets/icons/location.svg';
import searchIcon from './assets/icons/search.svg';
import backgroundImage from './assets/Background/background.png';

function App() {
  console.log("Env key loaded?", process.env.REACT_APP_GROQ_API_KEY);

  const [location, setLocation] = useState('');
  const [mood, setMood] = useState('');
  const [suggestedFood, setSuggestedFood] = useState('');
  const [explanation, setExplanation] = useState('');

  const groq = new Groq({ 
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
  });

  const getGroqChatCompletion = async () => {
    const prompt = `I am in ${location}, and I feel ${mood}. Can you suggest only one food item in this format: "Suggested food: Food name, explanation"? The explanation must be within 30 words.`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
      });

      const response = chatCompletion.choices[0]?.message?.content || '';
      console.log('API Response:', response); // Log the API response

      // Updated regex to capture explanation without parentheses
      const foodMatch = response.match(/Suggested food\s*:\s*([^,]+?)(?:,\s*(.+?))?$/i);

      if (foodMatch) {
        setSuggestedFood(foodMatch[1].trim()); // Trim extra spaces
        const explanation = foodMatch[2]?.trim() || 'No explanation provided.';
        setExplanation(explanation.replace(/\(.*?\)/g, '').trim()); // Remove parentheses if any
      } else {
        setSuggestedFood('something'); // Fallback if no valid match is found
        setExplanation('No explanation available');
      }

      return response;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "An error occurred while fetching AI response.";
    }
  };

  const handleClick = async () => {
    if (location && mood) {
      setSuggestedFood('');
      setExplanation('');
      await getGroqChatCompletion();
    } else {
      alert('Please fill in both fields.');
    }
  };

  return (
    <div className='appBody' style={{backgroundImage: `url(${backgroundImage})`,
                                    position: 'absolute',
                                    width: '100%',
                                    margin: '0 !important',
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat'
                                    
                                    
    }}>
      <div className='content'>
        <h1 className='title'>My Food</h1>
        <div className='container'>
          <div className='locationBox'>
            <img src={locationIcon} alt="Location Icon" className='icon' />
            <input
              className='locationInput'
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className='moodBox'>
            <img src={searchIcon} alt="Mood Icon" className='icon' />
            <input
              className='moodInput'
              type="text"
              placeholder="Describe your mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>
          <button className='button1' onClick={handleClick}>Suggest me a food</button>
        </div>

            {suggestedFood && (
              <>
        <div className='botomContainer'>
          <div className='outPutContainer'>
                <div className='foodAndReasonContainer'>

                  <div >
                    <p className='foodName'> {suggestedFood}</p>
                  </div>
                  <div>
                    <p className='foodReason'>Try this! {explanation}</p>
                  </div>
                </div>
                <div className='center'>
                  <button className='button2' onClick={() => window.open(`https://www.swiggy.com/search?query=${suggestedFood}`, '_blank')}>
                    Order {suggestedFood} in Swiggy
                  </button>
                </div>
          </div>
        </div>
              </>
            )}
      </div>
    </div>
  );
}

export default App;
