/**
 * CustomerInfoCard Component
 * Display comprehensive customer information
 */

interface CustomerInfoCardProps {
  customerName: string;
  userId: string;
  dateJoined: string;
  email: string;
  phoneNumber: string;
  gender: string;
  address: string;
}

export default function CustomerInfoCard({
  customerName,
  userId,
  dateJoined,
  email,
  phoneNumber,
  gender,
  address
}: CustomerInfoCardProps) {
  const fields = [
    { label: 'Customer Name', value: customerName },
    { label: 'User ID', value: userId },
    { label: 'Date Joined', value: dateJoined },
    { label: 'Email address', value: email },
    { label: 'Phone number', value: phoneNumber },
    { label: 'Gender', value: gender },
    { label: 'Address', value: address }
  ];

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #EAECF0',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '1126px'
      }}
    >
      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        {fields.map((field, index) => (
          <div key={index} className={field.label === 'Address' ? 'col-span-2' : ''}>
            <p
              className="text-sm font-normal mb-1"
              style={{ color: '#7C8FAC' }}
            >
              {field.label}
            </p>
            <div className="min-w-0">
              <p
                className={`text-base font-normal ${field.label === 'Email address' || field.label === 'Address' ? 'truncate' : ''}`}
                style={{ color: '#1E3146' }}
                title={field.label === 'Email address' || field.label === 'Address' ? field.value : undefined}
              >
                {field.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
