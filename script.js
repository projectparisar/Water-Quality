// Environmental Data Analysis with HuggingFace API
// This script collects location, AQI, weather data and performs ML inference

const HUGGINGFACE_API_KEY = 'hf_your_api_key_here'; // Replace with your actual API key
const HF_USERNAME = 'projectparisar';
const MODEL_NAME = 'environmental-analysis-model'; // Replace with actual model name

class EnvironmentalDataAnalyzer {
    constructor(apiKey, username, modelName) {
        this.apiKey = apiKey;
        this.modelEndpoint = `https://api-inference.huggingface.co/models/${username}/${modelName}`;
        this.headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    // Collect environmental input data
    collectEnvironmentalData() {
        return {
            location: {
                city: document.getElementById('city')?.value || 'Mumbai',
                latitude: parseFloat(document.getElementById('latitude')?.value) || 19.0760,
                longitude: parseFloat(document.getElementById('longitude')?.value) || 72.8777,
                country: document.getElementById('country')?.value || 'India'
            },
            airQuality: {
                aqi: parseInt(document.getElementById('aqi')?.value) || 150,
                pm25: parseFloat(document.getElementById('pm25')?.value) || 55.5,
                pm10: parseFloat(document.getElementById('pm10')?.value) || 95.2,
                co: parseFloat(document.getElementById('co')?.value) || 1.2,
                no2: parseFloat(document.getElementById('no2')?.value) || 42.3,
                o3: parseFloat(document.getElementById('o3')?.value) || 65.8,
                so2: parseFloat(document.getElementById('so2')?.value) || 15.4
            },
            weather: {
                temperature: parseFloat(document.getElementById('temperature')?.value) || 28.5,
                humidity: parseFloat(document.getElementById('humidity')?.value) || 65,
                pressure: parseFloat(document.getElementById('pressure')?.value) || 1013.25,
                windSpeed: parseFloat(document.getElementById('windSpeed')?.value) || 12.5,
                windDirection: document.getElementById('windDirection')?.value || 'NW',
                precipitation: parseFloat(document.getElementById('precipitation')?.value) || 0,
                cloudCover: parseFloat(document.getElementById('cloudCover')?.value) || 40
            },
            timestamp: new Date().toISOString()
        };
    }

    // Format data for model input
    formatInputForModel(data) {
        // Format depends on your model's expected input structure
        return {
            inputs: {
                location: `${data.location.city}, ${data.location.country}`,
                coordinates: `${data.location.latitude},${data.location.longitude}`,
                aqi: data.airQuality.aqi,
                pm25: data.airQuality.pm25,
                pm10: data.airQuality.pm10,
                pollutants: {
                    co: data.airQuality.co,
                    no2: data.airQuality.no2,
                    o3: data.airQuality.o3,
                    so2: data.airQuality.so2
                },
                temperature: data.weather.temperature,
                humidity: data.weather.humidity,
                wind_speed: data.weather.windSpeed,
                wind_direction: data.weather.windDirection,
                pressure: data.weather.pressure,
                precipitation: data.weather.precipitation,
                cloud_cover: data.weather.cloudCover
            }
        };
    }

    // Make inference call to HuggingFace API
    async performInference(inputData) {
        try {
            console.log('Sending data to HuggingFace model...');
            console.log('Endpoint:', this.modelEndpoint);
            
            const response = await fetch(this.modelEndpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(inputData)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Inference error:', error);
            throw error;
        }
    }

    // Main analysis function
    async analyzeEnvironmentalData() {
        try {
            // Step 1: Collect data from form inputs
            console.log('Collecting environmental data...');
            const rawData = this.collectEnvironmentalData();
            console.log('Raw data:', rawData);

            // Step 2: Format for model
            console.log('Formatting data for model...');
            const formattedInput = this.formatInputForModel(rawData);
            console.log('Formatted input:', formattedInput);

            // Step 3: Perform inference
            console.log('Performing inference...');
            const prediction = await this.performInference(formattedInput);
            console.log('Prediction result:', prediction);

            // Step 4: Display results
            this.displayResults(prediction, rawData);

            return prediction;

        } catch (error) {
            console.error('Analysis failed:', error);
            this.displayError(error.message);
            throw error;
        }
    }

    // Display results in the UI
    displayResults(prediction, inputData) {
        const resultContainer = document.getElementById('results');
        if (!resultContainer) {
            console.log('Results:', prediction);
            return;
        }

        resultContainer.innerHTML = `
            <div class="result-card">
                <h3>Environmental Analysis Results</h3>
                <div class="input-summary">
                    <h4>Input Data Summary:</h4>
                    <p><strong>Location:</strong> ${inputData.location.city}</p>
                    <p><strong>AQI:</strong> ${inputData.airQuality.aqi}</p>
                    <p><strong>Temperature:</strong> ${inputData.weather.temperature}°C</p>
                    <p><strong>Wind Speed:</strong> ${inputData.weather.windSpeed} km/h</p>
                </div>
                <div class="prediction-output">
                    <h4>Model Prediction:</h4>
                    <pre>${JSON.stringify(prediction, null, 2)}</pre>
                </div>
            </div>
        `;
    }

    // Display error message
    displayError(message) {
        const resultContainer = document.getElementById('results');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="error-card">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <p>Please check your API key and model configuration.</p>
                </div>
            `;
        }
    }
}

// Initialize analyzer
const analyzer = new EnvironmentalDataAnalyzer(
    HUGGINGFACE_API_KEY,
    HF_USERNAME,
    MODEL_NAME
);

// Event listener for form submission
document.getElementById('analyzeBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await analyzer.analyzeEnvironmentalData();
});

// Auto-analyze on page load with default values (optional)
window.addEventListener('load', () => {
    console.log('Environmental Data Analyzer initialized');
    console.log(`Using model: ${HF_USERNAME}/${MODEL_NAME}`);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentalDataAnalyzer;
}
