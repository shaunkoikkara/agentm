-- \c ai_receptionist;

INSERT INTO tenants (
    id, 
    email, 
    password_hash, 
    business_name, 
    business_category, 
    business_description,
    receptionist_name
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'demo@clinic.com',
    '$2a$10$X7UrE3GnM3YGQxqPmKZXt.9JZgE5LxMQhM5H8kA9vXmLR8mvYspMu',
    'SmileCare Dental Clinic',
    'Dental',
    'A premier dental clinic providing comprehensive oral care services.',
    'Sarah'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO knowledge_items (tenant_id, type, title, content, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'faq', 'What are your hours?', 'We are open Monday to Friday from 9 AM to 6 PM, and Saturday from 9 AM to 2 PM. We are closed on Sundays.', 1),
('550e8400-e29b-41d4-a716-446655440000', 'faq', 'Do you accept insurance?', 'Yes, we accept most major dental insurance plans. Please provide your insurance details before your appointment.', 2),
('550e8400-e29b-41d4-a716-446655440000', 'faq', 'Where are you located?', 'We are located at 123 Main Street, Suite 100, Cityville, State, 12345.', 3),
('550e8400-e29b-41d4-a716-446655440000', 'faq', 'How do I cancel an appointment?', 'Please let us know at least 24 hours in advance if you need to cancel or reschedule your appointment.', 4),
('550e8400-e29b-41d4-a716-446655440000', 'faq', 'Are you accepting new patients?', 'Yes, we are currently accepting new patients! We would love to have you join our dental family.', 5),
('550e8400-e29b-41d4-a716-446655440000', 'service', 'Teeth Cleaning', 'Professional teeth cleaning. Cost: $100.', 6),
('550e8400-e29b-41d4-a716-446655440000', 'service', 'Teeth Whitening', 'Professional teeth whitening service. Cost: $250.', 7),
('550e8400-e29b-41d4-a716-446655440000', 'service', 'Dental Consultation', 'Initial consultation with the dentist. Cost: $50.', 8)
ON CONFLICT DO NOTHING;
