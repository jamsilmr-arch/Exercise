renderBottomNav('analysis');

window.openPerfDetail = function(name) {
    document.getElementById('ad-title').innerText = name;
    document.getElementById('ad-render').innerHTML = `
        <div class="pd-chart-section"><div class="pd-chart-top"><span class="pd-c-badge">고중량 <span style="color:#aaa; font-weight:normal; margin-left:4px;">4~7회</span></span><span class="pd-c-record">최고 기록 <span>25kg · 7회</span></span></div>
        <div class="pd-graph-area"><div class="pd-y-axis"><span>30</span><span>25</span><span>20</span></div><div class="pd-graph-content"><div class="pd-dot-wrapper" style="bottom: 50%;"><div class="pd-dot"></div><span class="pd-dot-date">09. 07.</span></div></div></div></div>
    `;
    document.getElementById('view-analysis-list').classList.remove('active');
    document.getElementById('view-analysis-detail').classList.add('active');
};

window.closePerfDetail = function() {
    document.getElementById('view-analysis-detail').classList.remove('active');
    document.getElementById('view-analysis-list').classList.add('active');
};
