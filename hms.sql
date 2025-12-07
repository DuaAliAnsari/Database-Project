-- Doctors Table
CREATE TABLE Doctors (
    doctor_id INTEGER PRIMARY KEY,
    doctor_name VARCHAR2(100) NOT NULL,
    department VARCHAR2(100),
    phone_number VARCHAR2(20),
    email VARCHAR2(100)
);

-- Nurses Table
CREATE TABLE Nurses (
    nurse_id INTEGER PRIMARY KEY,
    nurse_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100),
    phone_number VARCHAR2(20),
    department VARCHAR2(100)
);

-- Rooms Table
CREATE TABLE Rooms (
    room_id INTEGER PRIMARY KEY,
    room_number VARCHAR2(20) NOT NULL UNIQUE,
    room_type VARCHAR2(50),
    capacity INTEGER,
    availability NUMBER(1) CHECK (availability IN (0, 1)),
    CONSTRAINT chk_capacity CHECK (capacity > 0)
);

-- Patients Table
CREATE TABLE Patients (
    patient_id INTEGER PRIMARY KEY,
    patient_name VARCHAR2(100) NOT NULL,
    phone_number VARCHAR2(20),
    date_of_birth DATE,
    gender VARCHAR2(10),
    age INTEGER,
    CONSTRAINT chk_gender CHECK (gender IN ('Male', 'Female', 'Other'))
);

CREATE INDEX idx_patient_phone ON Patients(phone_number);

-- Medical_history Table
CREATE TABLE Medical_history (
    patient_id INTEGER PRIMARY KEY,
    blood_group VARCHAR2(5),
    allergies CLOB,
    past_surgeries_operations CLOB,
    vaccination_history CLOB,
    family_history CLOB,
    medical_checks CLOB,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT chk_blood_group CHECK (
        blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    )
);

-- Walk-in Table
CREATE TABLE Walkin (
    walkin_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    visit_date DATE NOT NULL,
    visit_time VARCHAR2(20) NOT NULL,  -- Oracle has no TIME type
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

CREATE INDEX idx_walkin_date ON Walkin(visit_date);

-- Appointment Table
CREATE TABLE Appointment (
    appointment_id INTEGER PRIMARY KEY,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,  -- DATETIME → DATE
    appointment_time VARCHAR2(20),   -- TIME → VARCHAR2
    status VARCHAR2(20) NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    CONSTRAINT chk_appointment_status CHECK (
        status IN ('Scheduled', 'Completed', 'Cancelled', 'No-Show')
    )
);

CREATE INDEX idx_appointment_date ON Appointment(appointment_date);
CREATE INDEX idx_appointment_doctor ON Appointment(doctor_id);
CREATE INDEX idx_appointment_patient ON Appointment(patient_id);

-- Visit_specific_record Table
CREATE TABLE Visit_specific_record (
    record_id INTEGER PRIMARY KEY,
    appointment_id INTEGER,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    diagnosis CLOB,
    symptoms CLOB,
    treatment_notes CLOB,
    visit_date DATE NOT NULL,
    blood_pressure VARCHAR2(20),
    temperature NUMBER(4,1),
    weight NUMBER(5,2),
    time VARCHAR2(20),  -- TIME → VARCHAR2
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
    CONSTRAINT chk_temperature CHECK (
        temperature IS NULL OR temperature BETWEEN 35.0 AND 45.0
    ),
    CONSTRAINT chk_weight CHECK (weight IS NULL OR weight > 0)
);

CREATE INDEX idx_visit_date ON Visit_specific_record(visit_date);
CREATE INDEX idx_visit_patient ON Visit_specific_record(patient_id);

-- Prescription Table
CREATE TABLE Prescription (
    prescription_id INTEGER PRIMARY KEY,
    appointment_id INTEGER,
    walkin_id INTEGER,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    medication_name VARCHAR2(100) NOT NULL,
    dosage VARCHAR2(50),
    frequency VARCHAR2(50),
    duration VARCHAR2(50),
    instructions CLOB,
    issue_date DATE,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id),
    FOREIGN KEY (walkin_id) REFERENCES Walkin(walkin_id),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

CREATE INDEX idx_prescription_patient ON Prescription(patient_id);
CREATE INDEX idx_prescription_date ON Prescription(issue_date);

-- Lab_tests Table
CREATE TABLE Lab_tests (
    test_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    test_type VARCHAR2(100),
    appointment_id INTEGER,
    walkin_id INTEGER,
    test_date DATE,
    result_date DATE,
    remarks CLOB,
    status VARCHAR2(20),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id),
    FOREIGN KEY (walkin_id) REFERENCES Walkin(walkin_id),
    CONSTRAINT chk_test_status CHECK (
        status IN ('Pending', 'Completed', 'Cancelled')
    ),
    CONSTRAINT chk_result_date CHECK (
        result_date IS NULL OR result_date >= test_date
    )
);

CREATE INDEX idx_test_patient ON Lab_tests(patient_id);
CREATE INDEX idx_test_date ON Lab_tests(test_date);

-- Billing Table
CREATE TABLE Billing (
    billing_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    walkin_id INTEGER,
    bill_date DATE NOT NULL,
    total_amount NUMBER(10,2) NOT NULL,
    tax_amount NUMBER(10,2),
    payment_status VARCHAR2(20) NOT NULL,
    payment_method VARCHAR2(50),
    payment_date DATE,
    bill_type VARCHAR2(50),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id),
    FOREIGN KEY (walkin_id) REFERENCES Walkin(walkin_id),
    CONSTRAINT chk_payment_status CHECK (
        payment_status IN ('Paid', 'Pending', 'Overdue', 'Cancelled')
    ),
    CONSTRAINT chk_payment_method CHECK (
        payment_method IS NULL OR payment_method
        IN ('Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Online')
    ),
    CONSTRAINT chk_total_amount CHECK (total_amount >= 0),
    CONSTRAINT chk_tax_amount CHECK (tax_amount IS NULL OR tax_amount >= 0),
    CONSTRAINT chk_payment_date CHECK (
        payment_date IS NULL OR payment_date >= bill_date
    )
);

CREATE INDEX idx_billing_patient ON Billing(patient_id);
CREATE INDEX idx_billing_date ON Billing(bill_date);

-- Room_Assignment Table
CREATE TABLE Room_Assignment (
    assignment_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    admission_date DATE NOT NULL,   -- DATETIME → DATE
    discharge_date DATE,
    status VARCHAR2(20),
    appointment_id INTEGER,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id),
    CONSTRAINT chk_assignment_status CHECK (
        status IN ('Active', 'Discharged', 'Transferred')
    ),
    CONSTRAINT chk_discharge_date CHECK (
        discharge_date IS NULL OR discharge_date > admission_date
    )
);

CREATE INDEX idx_room_assignment_patient ON Room_Assignment(patient_id);
CREATE INDEX idx_room_assignment_room ON Room_Assignment(room_id);

-- Nurse_assignment Table
CREATE TABLE Nurse_assignment (
    nurse_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    shift_status VARCHAR2(20) DEFAULT 'Active',
    CONSTRAINT chk_shift_status CHECK (
        shift_status IN ('Morning', 'Evening', 'Night', 'Off-Duty')
    ),
    PRIMARY KEY (nurse_id, room_id),
    FOREIGN KEY (nurse_id) REFERENCES Nurses(nurse_id),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
);

CREATE INDEX idx_nurse_assignment_nurse ON Nurse_assignment(nurse_id);
CREATE INDEX idx_nurse_assignment_room ON Nurse_assignment(room_id);

---------------------------------------------------------
-- INSERT INTO Doctors
---------------------------------------------------------
INSERT INTO Doctors VALUES (1, 'Dr. Arjun Mehta', 'Cardiology', '9876543210', 'arjun.mehta@hospital.com');
INSERT INTO Doctors VALUES (2, 'Dr. Sara Khan', 'Neurology', '9812345678', 'sara.khan@hospital.com');
INSERT INTO Doctors VALUES (3, 'Dr. Rohan Patel', 'General Medicine', '9845123789', 'rohan.patel@hospital.com');

---------------------------------------------------------
-- INSERT INTO Nurses
---------------------------------------------------------
INSERT INTO Nurses VALUES (1, 'Nurse Aisha', 'aisha@hospital.com', '9001122334', 'ICU');
INSERT INTO Nurses VALUES (2, 'Nurse Priya', 'priya@hospital.com', '9002233445', 'General Ward');
INSERT INTO Nurses VALUES (3, 'Nurse John', 'john@hospital.com', '9003344556', 'Emergency');

---------------------------------------------------------
-- INSERT INTO Rooms
---------------------------------------------------------
INSERT INTO Rooms VALUES (101, 'A101', 'ICU', 2, 1);
INSERT INTO Rooms VALUES (102, 'A102', 'General', 4, 1);
INSERT INTO Rooms VALUES (103, 'B201', 'Private', 1, 0);

---------------------------------------------------------
-- INSERT INTO Patients
---------------------------------------------------------
INSERT INTO Patients VALUES (1, 'Amit Sharma', '9998877665', DATE '1990-05-20', 'Male', 34);
INSERT INTO Patients VALUES (2, 'Rina Das', '8887766554', DATE '1985-11-10', 'Female', 39);
INSERT INTO Patients VALUES (3, 'Samuel Roy', '7776655443', DATE '2000-03-14', 'Male', 24);

---------------------------------------------------------
-- INSERT INTO Medical_history
---------------------------------------------------------
INSERT INTO Medical_history VALUES (
    1, 'A+', 'None', 'Appendix removal in 2010', 'Up to date', 
    'No major hereditary issues', 'Annual checkup'
);

INSERT INTO Medical_history VALUES (
    2, 'O-', 'Penicillin', 'None', 'COVID Vaccinated', 
    'Diabetes in family', 'Quarterly checkup'
);

INSERT INTO Medical_history VALUES (
    3, 'B+', 'Dust allergy', 'None', 'Hepatitis B', 
    'No issues', 'Annual checkup'
);

---------------------------------------------------------
-- INSERT INTO Walkin
---------------------------------------------------------
INSERT INTO Walkin VALUES (1, 1, 3, DATE '2025-01-10', '10:30 AM');
INSERT INTO Walkin VALUES (2, 2, 1, DATE '2025-01-12', '11:15 AM');

---------------------------------------------------------
-- INSERT INTO Appointment
---------------------------------------------------------
INSERT INTO Appointment VALUES (1, 1, 1, DATE '2025-01-15', '09:00 AM', 'Scheduled');
INSERT INTO Appointment VALUES (2, 2, 2, DATE '2025-01-18', '02:30 PM', 'Completed');
INSERT INTO Appointment VALUES (3, 3, 3, DATE '2025-01-20', '04:15 PM', 'Scheduled');

---------------------------------------------------------
-- INSERT INTO Visit_specific_record
---------------------------------------------------------
INSERT INTO Visit_specific_record VALUES (
    1, 1, 1, 1, 'Mild chest discomfort', 'Shortness of breath', 
    'Prescribed ECG test', DATE '2025-01-15', '120/80', 37.0, 72.5, '09:30 AM'
);

INSERT INTO Visit_specific_record VALUES (
    2, 2, 2, 2, 'Migraine', 'Headache, dizziness', 
    'Pain relief medication', DATE '2025-01-18', '110/70', 36.5, 60.0, '03:00 PM'
);

---------------------------------------------------------
-- INSERT INTO Prescription
---------------------------------------------------------
INSERT INTO Prescription VALUES (
    1, 1, NULL, 1, 1, 'Aspirin', '75 mg', 'Once daily', 
    '7 days', 'Take after food', DATE '2025-01-15'
);

INSERT INTO Prescription VALUES (
    2, NULL, 1, 1, 3, 'Paracetamol', '500 mg', 'Twice daily', 
    '5 days', 'Take with water', DATE '2025-01-10'
);

INSERT INTO Prescription VALUES (
    3, 2, NULL, 2, 2, 'Ibuprofen', '200 mg', 'Twice daily', 
    '10 days', 'Avoid empty stomach', DATE '2025-01-18'
);

---------------------------------------------------------
-- INSERT INTO Lab_tests
---------------------------------------------------------
INSERT INTO Lab_tests VALUES (
    1, 1, 'Blood Test', 1, NULL, 
    DATE '2025-01-16', DATE '2025-01-17', 'Normal', 'Completed'
);

INSERT INTO Lab_tests VALUES (
    2, 2, 'MRI Scan', 2, NULL, 
    DATE '2025-01-18', NULL, 'Pending report', 'Pending'
);

INSERT INTO Lab_tests VALUES (
    3, 3, 'X-Ray', 3, NULL, 
    DATE '2025-01-20', DATE '2025-01-20', 'No issues found', 'Completed'
);

---------------------------------------------------------
-- INSERT INTO Billing
---------------------------------------------------------
INSERT INTO Billing VALUES (
    1, 1, 1, NULL, DATE '2025-01-15', 
    1500.00, 150.00, 'Paid', 'Credit Card', DATE '2025-01-15', 'Appointment'
);

INSERT INTO Billing VALUES (
    2, 2, 2, NULL, DATE '2025-01-18', 
    2500.00, 250.00, 'Pending', 'Cash', NULL, 'Appointment'
);

INSERT INTO Billing VALUES (
    3, 1, NULL, 1, DATE '2025-01-10', 
    800.00, 80.00, 'Paid', 'Cash', DATE '2025-01-10', 'Walk-in'
);

---------------------------------------------------------
-- INSERT INTO Room_Assignment
---------------------------------------------------------
INSERT INTO Room_Assignment VALUES (
    1, 1, 101, DATE '2025-01-12', DATE '2025-01-15', 'Discharged', 1
);

INSERT INTO Room_Assignment VALUES (
    2, 2, 102, DATE '2025-01-18', NULL, 'Active', 2
);

---------------------------------------------------------
-- INSERT INTO Nurse_assignment
---------------------------------------------------------
INSERT INTO Nurse_assignment VALUES (1, 101, 'Morning');
INSERT INTO Nurse_assignment VALUES (2, 102, 'Evening');
INSERT INTO Nurse_assignment VALUES (3, 103, 'Night');

--CREATE SEQUENCE medical_history_seq
--START WITH 1
--INCREMENT BY 1;

CREATE OR REPLACE PROCEDURE add_medical_history(
    p_patient_id IN NUMBER,
    p_blood_group IN VARCHAR2,
    p_allergies IN CLOB,
    p_surgeries IN CLOB,
    p_vaccination IN CLOB,
    p_family IN CLOB,
    p_medical_checks IN CLOB
)
IS
BEGIN
    INSERT INTO Medical_history (
        patient_id, blood_group, allergies, past_surgeries_operations,
        vaccination_history, family_history, medical_checks
    )
    VALUES (
        p_patient_id, p_blood_group, p_allergies, p_surgeries,
        p_vaccination, p_family, p_medical_checks
    );
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE update_medical_history(
    p_patient_id IN NUMBER,
    p_blood_group IN VARCHAR2,
    p_allergies IN CLOB,
    p_surgeries IN CLOB,
    p_vaccination IN CLOB,
    p_family IN CLOB,
    p_medical_checks IN CLOB
)
IS
BEGIN
    UPDATE Medical_history
    SET blood_group = p_blood_group,
        allergies = p_allergies,
        past_surgeries_operations = p_surgeries,
        vaccination_history = p_vaccination,
        family_history = p_family,
        medical_checks = p_medical_checks
    WHERE patient_id = p_patient_id;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE get_medical_history(
    p_patient_id IN NUMBER,
    o_blood_group OUT VARCHAR2,
    o_allergies OUT CLOB,
    o_surgeries OUT CLOB,
    o_vaccination OUT CLOB,
    o_family OUT CLOB,
    o_medical_checks OUT CLOB
)
IS
BEGIN
    SELECT blood_group, allergies, past_surgeries_operations,
           vaccination_history, family_history, medical_checks
    INTO o_blood_group, o_allergies, o_surgeries, o_vaccination, o_family, o_medical_checks
    FROM Medical_history
    WHERE patient_id = p_patient_id;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        o_blood_group := NULL;
        o_allergies := NULL;
        o_surgeries := NULL;
        o_vaccination := NULL;
        o_family := NULL;
        o_medical_checks := NULL;
END;
/

CREATE OR REPLACE PROCEDURE delete_medical_history(
    p_patient_id IN NUMBER
)
IS
BEGIN
    DELETE FROM Medical_history
    WHERE patient_id = p_patient_id;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

BEGIN
    add_medical_history(
        3, 'AB+', 'None', 'Tonsillectomy in 2015', 'Up to date',
        'Heart disease in family', 'Monthly checkup'
    );
END;
/

BEGIN
    update_medical_history(
        4, 'AB+', 'Pollen allergy', 'Tonsillectomy in 2015', 'Up to date',
        'Heart disease in family', 'Monthly checkup'
    );
END;
/

DECLARE
    v_blood_group VARCHAR2(5);
    v_allergies CLOB;
    v_surgeries CLOB;
    v_vaccination CLOB;
    v_family CLOB;
    v_medical_checks CLOB;
BEGIN
    get_medical_history(4, v_blood_group, v_allergies, v_surgeries, v_vaccination, v_family, v_medical_checks);
    DBMS_OUTPUT.PUT_LINE('Blood Group: ' || v_blood_group);
    DBMS_OUTPUT.PUT_LINE('Allergies: ' || v_allergies);
END;
/

-- Example: delete patient with ID 4
BEGIN
    delete_medical_history(3);
END;
/

SET SERVEROUTPUT ON;
commit;

select * from medical_history;

SELECT owner, table_name FROM all_tables WHERE table_name = 'APPOINTMENT';
select * from doctors;
