# Search the Collection Spectrogram

I was particularly inspired by visualising the data in a way that reflects the NFSA values and purpose. The NFSA is Australia’s audiovisual archive institution. They collect, preserve and share Australia’s audiovisual culture. I was inspired by audio visualisation equipment and processes. This led me to explore the idea of making a website that has the aesthetics and functionality of a spectrogram. A spectrogram visually represents frequencies of a signal. I used the D3js library to complete my aim.

## AESTHETICS

I aimed for the aesthetic of the website to be inspired by early digital displays and analogue hardware. I used the colours that display on a spectrogram.

## VUE + D3JS

I gained a basic understanding of Vue and D3js by looking at resources such as videos, tutorials, references, your (Riley’s) [GitHub repository](https://github.com/jacksonpost/vueNFSA)/[website](https://jacksonpost.github.io/vueNFSA/) :) and by editing the files/creating demo files.

## AI

I used Copilot to troubleshoot coding problems I encountered. This was particularly helpful because I often encountered very specific problems which I didn’t know how to search up on Google. I would then try, and problem solve and work out what was wrong with my code.

## STACK OVERFLOW

I used the Stack Overflow forums to look for similar problems I encountered. I found this sometimes helpful where I could get a rough idea about the problem I was encountering.

## PROBLEMS

1. The tooltip didn’t display the data properly. It kept on saying undefined. I worked out the problem by specifying the array properties. There are still problems with it like how I cannot style anything within .tooltip correctly and not being able to display the ingURL. [website 1 reference](https://www.pluralsight.com/resources/blog/guides/create-tooltips-in-d3js)[website 2 reference](https://d3-graph-gallery.com/graph/interactivity_tooltip.html)
2. The graph displayed the date on the y axis which I wanted to switch. I looked up the problem on [Stack Overflow](https://stackoverflow.com/questions/34595124/how-to-change-color-of-the-dots-in-d3-js-to-reflect-data-on-y-scale) and then went through the code to change the targeted domain properties.
3. I wanted the dots to change colour on the axis to simulate a spectrogram display. The problem was that I could not define a HEX value as it a string.

## WEBSITE

[WEBSITE](https://github.com/jacksonpost/vueNFSA)
