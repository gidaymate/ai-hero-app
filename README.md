# AI Hero - Deployment Instructions

## What's in this folder:

```
ai-hero-backend/
├── index.html (your main website)
└── netlify/
    └── functions/
        └── generate-solution.js (backend function that handles AI API calls)
```

## How to deploy to Netlify:

### Option 1: Drag and Drop (Easiest!)

1. Go to https://app.netlify.com/drop
2. **Drag the ENTIRE `ai-hero-backend` FOLDER** into the drop zone
   - Don't drag individual files - drag the whole folder!
3. Netlify will deploy everything automatically
4. You'll get a URL like: `your-site-name.netlify.app`
5. Test it - the AI should work now!

### Option 2: Through Netlify Dashboard

1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag the `ai-hero-backend` folder
4. Done!

## How to test if it's working:

1. Go to your Netlify URL
2. Fill out the form with real information
3. Click "Generate My Custom AI Solution"
4. You should get an actual AI-generated response (not an error!)

## Troubleshooting:

**If you still get CORS errors:**
- Make sure you uploaded the FOLDER, not just the HTML file
- The folder structure must be exactly as shown above
- Wait a few minutes after deploying for Netlify Functions to activate

**If the AI doesn't respond:**
- Check your Anthropic API key is still valid at console.anthropic.com
- Make sure you have credits remaining ($5 you added)
- Check the browser console for specific error messages

## Important Notes:

- The API key is now safely hidden in the backend function
- No one can steal your API key from viewing the website source code
- Netlify Functions are free for the first 125,000 requests/month
- Each AI generation uses about 1-3 cents of your Anthropic credits

## Need Help?

If something's not working, open the browser console (F12) and take a screenshot of any red error messages!

Good luck! 🚀
