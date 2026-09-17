function Scoreboard() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '600px',
        background: '#0b3d24',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          background: '#062818',
          padding: '4px 12px',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          letterSpacing: '0.5px',
        }}
      >
        <span>WORLD SNOOKER CHAMPIONSHIP</span>
        <span>FRAME 3</span>
      </div>

      <div style={{ display: 'flex' }}>
        <div
          style={{
            flex: 1,
            background: '#0f5132',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRight: '2px solid #000',
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>RONNIE O'SULLIVAN</span>
          <span
            style={{
              background: '#000',
              padding: '2px 10px',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '3px',
            }}
          >
            2
          </span>
        </div>

        <div
          style={{
            flex: 1,
            background: '#0f5132',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              background: '#000',
              padding: '2px 10px',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '3px',
            }}
          >
            1
          </span>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>JUDD TRUMP</span>
        </div>
      </div>

      <div
        style={{
          background: '#062818',
          padding: '4px 12px',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>CURRENT BREAK: 47</span>
        <span>CRUCIBLE THEATRE, SHEFFIELD</span>
      </div>
    </div>
  );
}

export default Scoreboard;