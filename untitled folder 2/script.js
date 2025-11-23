// Global data storage
let appData = null;
let currentCareer = null;

// Color schemes
const riskColors = {
    'High': '#ff6b6b',
    'Medium': '#ffd966',
    'Low': '#00ff9d'
};

const categoryColors = [
    '#00ff9d', '#bd93f9', '#8be9fd', '#ff79c6', '#ffd966',
    '#ff6b6b', '#50fa7b', '#ffb86c', '#f1fa8c', '#ff5555'
];

// Load data
async function loadData() {
    try {
        const response = await fetch('data.json');
        appData = await response.json();
        console.log('Data loaded:', appData);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Navigation functions
function showLanding() {
    setActivePage('landing-page');
}

function showOverview() {
    setActivePage('overview-page');
    createOverviewChart();
    createCareerCards();
}

function showCareer(careerName) {
    currentCareer = careerName;
    setActivePage('career-page');
    populateCareerPage(careerName);
}

function setActivePage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

// Create overview automation risk chart - SIDE-BY-SIDE PILL DESIGN
function createOverviewChart() {
    const data = appData.automation_risk_overall;
    const container = d3.select('#overview-chart');
    container.html('');

    // Combine High + Medium into "At Risk"
    const atRisk = (data['High'] || 0) + (data['Medium'] || 0);
    const lowRisk = data['Low'] || 0;
    const total = atRisk + lowRisk;

    // Calculate percentages
    const atRiskPercent = ((atRisk / total) * 100).toFixed(0);
    const lowRiskPercent = ((lowRisk / total) * 100).toFixed(0);

    const width = container.node().offsetWidth;
    const height = 380; // Reduced from 500
    const padding = 40;
    const gapBetween = 30;

    // Make the visualization much larger - use more of the available space
    const totalWidth = width - (padding * 2) - gapBetween;
    const atRiskWidth = (atRisk / total) * totalWidth;
    const lowRiskWidth = (lowRisk / total) * totalWidth;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create gradient definitions
    const defs = svg.append('defs');

    // At Risk gradient (coral/orange)
    const atRiskGradient = defs.append('linearGradient')
        .attr('id', 'atRiskGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    atRiskGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ff6b6b');
    
    atRiskGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#ff8e53');
    
    atRiskGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffb347');

    // Low Risk gradient (green/teal)
    const lowRiskGradient = defs.append('linearGradient')
        .attr('id', 'lowRiskGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    lowRiskGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#00ff9d');
    
    lowRiskGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#00e5b8');
    
    lowRiskGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#00d4aa');

    const centerY = height / 2;
    const atRiskPillHeight = 220; // Even smaller
    const lowRiskPillHeight = 200; // Even smaller
    const atRiskPillY = centerY - (atRiskPillHeight / 2);
    const lowRiskPillY = centerY - (lowRiskPillHeight / 2);

    // At Risk Pill (Left) - Larger
    const atRiskGroup = svg.append('g')
        .style('opacity', 0);

    atRiskGroup.append('rect')
        .attr('x', padding)
        .attr('y', atRiskPillY)
        .attr('width', 0)
        .attr('height', atRiskPillHeight)
        .attr('rx', atRiskPillHeight / 2) // Fully rounded ends
        .attr('fill', 'url(#atRiskGradient)')
        .style('filter', 'drop-shadow(0 10px 40px rgba(255, 107, 107, 0.5))')
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('width', atRiskWidth);

    atRiskGroup.append('text')
        .attr('x', padding + atRiskWidth / 2)
        .attr('y', centerY - 35)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-label')
        .style('font-size', '28px')
        .style('font-weight', '700')
        .style('fill', '#1a1a1a')
        .style('letter-spacing', '3px')
        .text('AT RISK');

    atRiskGroup.append('text')
        .attr('x', padding + atRiskWidth / 2)
        .attr('y', centerY + 38)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-label')
        .style('font-size', '90px')
        .style('font-weight', '900')
        .style('fill', '#1a1a1a')
        .text(`${atRiskPercent}%`);

    atRiskGroup.append('text')
        .attr('x', padding + atRiskWidth / 2)
        .attr('y', centerY + 70)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-label')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', '#2a2a2a')
        .text(`${atRisk} positions`);

    atRiskGroup.transition()
        .delay(200)
        .duration(800)
        .style('opacity', 1);

    // Low Risk Pill (Right) - More pill-shaped (less circular)
    const lowRiskGroup = svg.append('g')
        .style('opacity', 0);

    const lowRiskX = padding + atRiskWidth + gapBetween;

    lowRiskGroup.append('rect')
        .attr('x', lowRiskX)
        .attr('y', lowRiskPillY)
        .attr('width', 0)
        .attr('height', lowRiskPillHeight)
        .attr('rx', lowRiskPillHeight / 2) // Fully rounded ends but smaller overall
        .attr('fill', 'url(#lowRiskGradient)')
        .style('filter', 'drop-shadow(0 10px 40px rgba(0, 255, 157, 0.5))')
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('width', lowRiskWidth);

    lowRiskGroup.append('text')
        .attr('x', lowRiskX + lowRiskWidth / 2)
        .attr('y', centerY - 32)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-label')
        .style('font-size', '24px')
        .style('font-weight', '700')
        .style('fill', '#1a1a1a')
        .style('letter-spacing', '3px')
        .text('LOW RISK');

    lowRiskGroup.append('text')
        .attr('x', lowRiskX + lowRiskWidth / 2)
        .attr('y', centerY + 35)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-label')
        .style('font-size', '80px')
        .style('font-weight', '900')
        .style('fill', '#1a1a1a')
        .text(`${lowRiskPercent}%`);

    lowRiskGroup.append('text')
        .attr('x', lowRiskX + lowRiskWidth / 2)
        .attr('y', centerY + 82)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-label')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', '#2a2a2a')
        .text(`${lowRisk} positions`);

    lowRiskGroup.transition()
        .delay(400)
        .duration(800)
        .style('opacity', 1);
}

// Create career cards
function createCareerCards() {
    const container = document.getElementById('career-cards');
    container.innerHTML = '';

    appData.careers.forEach(career => {
        const careerData = appData.career_data[career];
        
        // Determine dominant risk level
        const riskLevels = careerData.automation_risk;
        const dominantRisk = Object.keys(riskLevels).reduce((a, b) => 
            riskLevels[a] > riskLevels[b] ? a : b
        );

        const card = document.createElement('div');
        card.className = 'career-card';
        card.onclick = () => showCareer(career);
        
        card.innerHTML = `
            <h3>${career}</h3>
            <span class="risk-indicator risk-${dominantRisk.toLowerCase()}">
                ${dominantRisk} Risk
            </span>
        `;
        
        container.appendChild(card);
    });
}

// Populate career detail page
function populateCareerPage(careerName) {
    const careerData = appData.career_data[careerName];
    
    // Set title
    document.getElementById('career-title').textContent = careerName;
    
    // Set stats
    document.getElementById('avg-salary').textContent = 
        `$${careerData.avg_salary.toLocaleString()}`;
    
    // Get dominant growth projection
    const growthProj = careerData.growth_projection;
    const dominantGrowth = Object.keys(growthProj).reduce((a, b) => 
        growthProj[a] > growthProj[b] ? a : b
    );
    document.getElementById('growth-trend').textContent = dominantGrowth;
    
    // Create pill chart at TOP for automation risk
    createCareerRiskPills('risk-chart-top', careerData.automation_risk);
    
    // Create other charts
    createRiskPercentageChart('skills-chart', careerData.skills, careerData.automation_risk, careerData.total_count);
    createRiskPercentageChart('industry-chart', careerData.industry, careerData.automation_risk, careerData.total_count);
    createPieChart('workplace-chart', careerData.workplace);
    
    // Generate insights
    generateInsights(careerName, careerData);
}

// Create simple risk percentage cards for top 3 items
function createRiskPercentageChart(containerId, itemData, automationRiskData, totalCount) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    // Get top 3 items
    const sortedItems = Object.entries(itemData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Calculate what percentage of positions for this item have high/medium/low risk
    // Note: Since we don't have granular data, we'll show the overall career risk as a percentage
    const totalRisk = Object.values(automationRiskData).reduce((a, b) => a + b, 0);
    
    const riskPercentages = {
        'High': ((automationRiskData['High'] || 0) / totalRisk * 100).toFixed(0),
        'Medium': ((automationRiskData['Medium'] || 0) / totalRisk * 100).toFixed(0),
        'Low': ((automationRiskData['Low'] || 0) / totalRisk * 100).toFixed(0)
    };

    // Get dominant risk
    const dominantRisk = Object.keys(automationRiskData).reduce((a, b) => 
        automationRiskData[a] > automationRiskData[b] ? a : b
    );

    // Create card layout
    const cardsDiv = container.append('div')
        .style('display', 'grid')
        .style('grid-template-columns', 'repeat(auto-fit, minmax(200px, 1fr))')
        .style('gap', '20px')
        .style('margin-top', '20px');

    sortedItems.forEach(([item, count], index) => {
        const percentage = ((count / totalCount) * 100).toFixed(0);
        
        const card = cardsDiv.append('div')
            .style('background', '#1a1a1a')
            .style('border-radius', '15px')
            .style('padding', '25px')
            .style('border', `2px solid ${categoryColors[index]}`)
            .style('opacity', 0)
            .style('transform', 'translateY(20px)');

        // Item name
        card.append('div')
            .style('font-size', '16px')
            .style('font-weight', '600')
            .style('color', categoryColors[index])
            .style('margin-bottom', '15px')
            .style('text-align', 'center')
            .text(item);

        // Frequency percentage
        card.append('div')
            .style('font-size', '14px')
            .style('color', '#888')
            .style('margin-bottom', '10px')
            .style('text-align', 'center')
            .text('Frequency');

        card.append('div')
            .style('font-size', '36px')
            .style('font-weight', '700')
            .style('color', '#fff')
            .style('margin-bottom', '20px')
            .style('text-align', 'center')
            .text(`${percentage}%`);

        // Risk indicator
        card.append('div')
            .style('background', `${riskColors[dominantRisk]}20`)
            .style('border-radius', '20px')
            .style('padding', '8px 16px')
            .style('text-align', 'center')
            .style('font-size', '12px')
            .style('font-weight', '600')
            .style('color', riskColors[dominantRisk])
            .style('text-transform', 'uppercase')
            .style('letter-spacing', '1px')
            .text(`${dominantRisk} Risk: ${riskPercentages[dominantRisk]}%`);

        // Animate in
        card.transition()
            .delay(index * 150)
            .duration(500)
            .style('opacity', 1)
            .style('transform', 'translateY(0)');
    });
}

// Create simple risk breakdown bar chart
function createRiskBreakdownChart(containerId, data) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const margin = {top: 20, right: 20, bottom: 40, left: 100};
    const width = container.node().offsetWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const categories = Object.keys(data).sort((a, b) => data[b] - data[a]);
    
    const x = d3.scaleLinear()
        .domain([0, d3.max(Object.values(data))])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(categories)
        .range([0, height])
        .padding(0.3);

    // Add bars
    svg.selectAll('.bar')
        .data(categories)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => y(d))
        .attr('width', 0)
        .attr('height', y.bandwidth())
        .attr('fill', d => riskColors[d])
        .attr('rx', 6)
        .transition()
        .duration(800)
        .attr('width', d => x(data[d]));

    // Add value labels
    svg.selectAll('.label')
        .data(categories)
        .enter()
        .append('text')
        .attr('class', 'chart-label')
        .attr('x', d => x(data[d]) + 10)
        .attr('y', d => y(d) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .style('font-size', '14px')
        .style('opacity', 0)
        .text(d => data[d])
        .transition()
        .delay(800)
        .duration(500)
        .style('opacity', 1);

    // Add y-axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '13px')
        .style('font-weight', '600');
}

// Create career-level pill design for At Risk vs Low Risk
function createCareerRiskPills(containerId, data) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    // Combine High + Medium into "At Risk"
    const atRisk = (data['High'] || 0) + (data['Medium'] || 0);
    const lowRisk = data['Low'] || 0;
    const total = atRisk + lowRisk;

    // Calculate percentages
    const atRiskPercent = ((atRisk / total) * 100).toFixed(0);
    const lowRiskPercent = ((lowRisk / total) * 100).toFixed(0);

    const width = container.node().offsetWidth;
    const height = 300; // Reduced height
    const padding = 30;
    const gapBetween = 20;

    const totalWidth = width - (padding * 2) - gapBetween;
    const atRiskWidth = (atRisk / total) * totalWidth;
    const lowRiskWidth = (lowRisk / total) * totalWidth;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create gradient definitions
    const defs = svg.append('defs');

    // At Risk gradient
    const atRiskGradient = defs.append('linearGradient')
        .attr('id', 'careerAtRiskGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    atRiskGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ff6b6b');
    
    atRiskGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#ff8e53');
    
    atRiskGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffb347');

    // Low Risk gradient
    const lowRiskGradient = defs.append('linearGradient')
        .attr('id', 'careerLowRiskGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    lowRiskGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#00ff9d');
    
    lowRiskGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#00e5b8');
    
    lowRiskGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#00d4aa');

    const centerY = height / 2;
    const atRiskPillHeight = 180; // Smaller pills
    const lowRiskPillHeight = 160; // Smaller pills
    const atRiskPillY = centerY - (atRiskPillHeight / 2);
    const lowRiskPillY = centerY - (lowRiskPillHeight / 2);

    // At Risk Pill
    const atRiskGroup = svg.append('g')
        .style('opacity', 0);

    atRiskGroup.append('rect')
        .attr('x', padding)
        .attr('y', atRiskPillY)
        .attr('width', 0)
        .attr('height', atRiskPillHeight)
        .attr('rx', atRiskPillHeight / 2)
        .attr('fill', 'url(#careerAtRiskGradient)')
        .style('filter', 'drop-shadow(0 8px 30px rgba(255, 107, 107, 0.4))')
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('width', atRiskWidth);

    atRiskGroup.append('text')
        .attr('x', padding + atRiskWidth / 2)
        .attr('y', centerY - 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', '700')
        .style('fill', '#1a1a1a')
        .style('letter-spacing', '2px')
        .text('AT RISK');

    atRiskGroup.append('text')
        .attr('x', padding + atRiskWidth / 2)
        .attr('y', centerY + 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '56px')
        .style('font-weight', '900')
        .style('fill', '#1a1a1a')
        .text(`${atRiskPercent}%`);

    atRiskGroup.append('text')
        .attr('x', padding + atRiskWidth / 2)
        .attr('y', centerY + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#2a2a2a')
        .text(`${atRisk} positions`);

    atRiskGroup.transition()
        .delay(200)
        .duration(600)
        .style('opacity', 1);

    // Low Risk Pill
    const lowRiskGroup = svg.append('g')
        .style('opacity', 0);

    const lowRiskX = padding + atRiskWidth + gapBetween;

    lowRiskGroup.append('rect')
        .attr('x', lowRiskX)
        .attr('y', lowRiskPillY)
        .attr('width', 0)
        .attr('height', lowRiskPillHeight)
        .attr('rx', lowRiskPillHeight / 2)
        .attr('fill', 'url(#careerLowRiskGradient)')
        .style('filter', 'drop-shadow(0 8px 30px rgba(0, 255, 157, 0.4))')
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('width', lowRiskWidth);

    lowRiskGroup.append('text')
        .attr('x', lowRiskX + lowRiskWidth / 2)
        .attr('y', centerY - 22)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '700')
        .style('fill', '#1a1a1a')
        .style('letter-spacing', '2px')
        .text('LOW RISK');

    lowRiskGroup.append('text')
        .attr('x', lowRiskX + lowRiskWidth / 2)
        .attr('y', centerY + 22)
        .attr('text-anchor', 'middle')
        .style('font-size', '50px')
        .style('font-weight', '900')
        .style('fill', '#1a1a1a')
        .text(`${lowRiskPercent}%`);

    lowRiskGroup.append('text')
        .attr('x', lowRiskX + lowRiskWidth / 2)
        .attr('y', centerY + 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#2a2a2a')
        .text(`${lowRisk} positions`);

    lowRiskGroup.transition()
        .delay(350)
        .duration(600)
        .style('opacity', 1);
}

// Create pie chart
function createPieChart(containerId, data) {
    const container = d3.select(`#${containerId}`);
    container.html('');

    const width = container.node().offsetWidth;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(['#00ff9d', '#bd93f9']);

    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);

    const pieData = pie(Object.entries(data).map(([key, value]) => ({
        key, value
    })));

    // Add arcs
    const arcs = svg.selectAll('.arc')
        .data(pieData)
        .enter()
        .append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.key))
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1)
        .attrTween('d', function(d) {
            const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });

    // Add labels
    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-label')
        .style('font-size', '14px')
        .style('opacity', 0)
        .text(d => `${d.data.key}: ${d.data.value}`)
        .transition()
        .delay(800)
        .duration(500)
        .style('opacity', 1);
}

// Generate insights
function generateInsights(careerName, data) {
    const container = document.getElementById('insights-content');
    container.innerHTML = '';

    const insights = [];

    // Skill insight
    const topSkill = Object.keys(data.skills).reduce((a, b) => 
        data.skills[a] > data.skills[b] ? a : b
    );
    insights.push({
        title: 'Most Required Skill',
        text: `${topSkill} is the most frequently required skill for ${careerName} positions, appearing in ${data.skills[topSkill]} of ${data.total_count} analyzed positions.`
    });

    // Industry insight
    const topIndustry = Object.keys(data.industry).reduce((a, b) => 
        data.industry[a] > data.industry[b] ? a : b
    );
    insights.push({
        title: 'Primary Industry',
        text: `The ${topIndustry} sector employs the majority of ${careerName} professionals, accounting for ${data.industry[topIndustry]} positions in our dataset.`
    });

    // Remote work insight
    const remoteYes = data.workplace['Yes'] || 0;
    const remoteNo = data.workplace['No'] || 0;
    const remotePercentage = ((remoteYes / (remoteYes + remoteNo)) * 100).toFixed(1);
    insights.push({
        title: 'Remote Work Flexibility',
        text: `${remotePercentage}% of ${careerName} positions offer remote work options, ${remotePercentage > 50 ? 'indicating high flexibility' : 'suggesting primarily on-site work'}.`
    });

    // Automation risk insight
    const topRisk = Object.keys(data.automation_risk).reduce((a, b) => 
        data.automation_risk[a] > data.automation_risk[b] ? a : b
    );
    insights.push({
        title: 'Automation Risk Assessment',
        text: `Most ${careerName} positions (${data.automation_risk[topRisk]} out of ${data.total_count}) are classified as ${topRisk} automation risk, ${
            topRisk === 'High' ? 'suggesting this role may face significant disruption from AI technologies' :
            topRisk === 'Medium' ? 'indicating moderate exposure to automation' :
            'showing strong resilience against automation'
        }.`
    });

    // Growth projection insight
    const topGrowth = Object.keys(data.growth_projection).reduce((a, b) => 
        data.growth_projection[a] > data.growth_projection[b] ? a : b
    );
    insights.push({
        title: 'Market Outlook',
        text: `The majority of ${careerName} positions are projected to experience ${topGrowth.toLowerCase()} in job availability, with ${data.growth_projection[topGrowth]} positions showing this trend.`
    });

    // Render insights
    insights.forEach(insight => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.innerHTML = `
            <h4>${insight.title}</h4>
            <p>${insight.text}</p>
        `;
        container.appendChild(item);
    });
}

// Initialize app
async function init() {
    await loadData();
    console.log('App initialized');
}

// Run on page load
init();