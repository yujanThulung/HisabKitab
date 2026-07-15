const DashboardTest = () => {
  console.log('Dashboard component is rendering!');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Dashboard Test</h1>
      <p>If you can see this, the dashboard is rendering correctly!</p>
      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0' }}>
        <p>✅ Component loaded</p>
        <p>✅ Route working</p>
        <p>✅ Authentication passed</p>
      </div>
    </div>
  );
};

export default DashboardTest;
