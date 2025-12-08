
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

-- Walk-in Table (THIS WAS MISSING!)
CREATE TABLE Walkin (
    walkin_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    visit_date DATE NOT NULL,
    visit_time VARCHAR2(20) NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE
);

CREATE INDEX idx_walkin_date ON Walkin(visit_date);


-- Appointment Table
CREATE TABLE Appointment (
    appointment_id INTEGER PRIMARY KEY,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,  
    appointment_time VARCHAR2(20),   
    status VARCHAR2(20) NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT chk_appointment_status CHECK (
        status IN ('Scheduled', 'Completed', 'Cancelled', 'No-Show')
    )
);




CREATE INDEX idx_appointment_date ON Appointment(appointment_date);
CREATE INDEX idx_appointment_doctor ON Appointment(doctor_id);
CREATE INDEX idx_appointment_patient ON Appointment(patient_id);

CREATE OR REPLACE TRIGGER check_appointment_limit
FOR INSERT OR UPDATE ON Appointment
COMPOUND TRIGGER

  -- Temporary collection to store doctor/date combinations
  TYPE doctor_date_tab IS TABLE OF VARCHAR2(100);
  doc_date_list doctor_date_tab := doctor_date_tab();

  -- Before each row: store doctor_id & date
  BEFORE EACH ROW IS
  BEGIN
    doc_date_list.EXTEND;
    doc_date_list(doc_date_list.LAST) := :NEW.doctor_id || ':' || TO_CHAR(:NEW.appointment_date,'YYYYMMDD');
  END BEFORE EACH ROW;

  -- After statement: check counts for each unique doctor/date
  AFTER STATEMENT IS
    v_count NUMBER;
    v_doc NUMBER;
    v_date DATE;
  BEGIN
    FOR i IN 1..doc_date_list.COUNT LOOP
      v_doc := TO_NUMBER(REGEXP_SUBSTR(doc_date_list(i), '^[^:]+'));
      v_date := TO_DATE(REGEXP_SUBSTR(doc_date_list(i), '[^:]+$'),'YYYYMMDD');

      SELECT COUNT(*)
      INTO v_count
      FROM Appointment
      WHERE doctor_id = v_doc
        AND TRUNC(appointment_date) = TRUNC(v_date)
        AND status IN ('Scheduled','Completed');

      IF v_count > 20 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Doctor ' || v_doc || ' has exceeded 20 appointments on ' || v_date);
      END IF;
    END LOOP;
  END AFTER STATEMENT;

END;
/

--CREATE OR REPLACE TRIGGER check_appointment_limit
--BEFORE INSERT OR UPDATE ON Appointment
--FOR EACH ROW
--DECLARE
--    v_count NUMBER;
--BEGIN
--    -- Count existing appointments for this doctor on this date
--    SELECT COUNT(*)
--    INTO v_count
--    FROM Appointment
--    WHERE doctor_id = :NEW.doctor_id
--      AND TRUNC(appointment_date) = TRUNC(:NEW.appointment_date)
--      AND status IN ('Scheduled', 'Completed');
--
--    -- If updating, exclude the current appointment from count
--    IF UPDATING THEN
--        -- Only subtract if doctor_id and date remain same
--        IF :OLD.doctor_id = :NEW.doctor_id 
--           AND TRUNC(:OLD.appointment_date) = TRUNC(:NEW.appointment_date) THEN
--            v_count := v_count - 1;
--        END IF;
--    END IF;
--
--    -- Raise error if limit exceeded
--    IF v_count >= 20 THEN
--        RAISE_APPLICATION_ERROR(
--            -20001, 
--            'Cannot schedule appointment. Doctor has reached maximum of 20 appointments for this date.'
--        );
--    END IF;
--END;
--/

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
    time VARCHAR2(20),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE,
    CONSTRAINT chk_temperature CHECK (
        temperature IS NULL OR temperature BETWEEN 35.0 AND 45.0
    ),
    CONSTRAINT chk_weight CHECK (weight IS NULL OR weight > 0)
);

CREATE INDEX idx_visit_date ON Visit_specific_record(visit_date);
CREATE INDEX idx_visit_patient ON Visit_specific_record(patient_id);

CREATE SEQUENCE visit_record_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_visit_record_id
BEFORE INSERT ON Visit_specific_record
FOR EACH ROW
BEGIN
    IF :NEW.record_id IS NULL THEN
        :NEW.record_id := visit_record_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE ADD_VISIT_RECORD (
    p_appointment_id IN NUMBER,
    p_patient_id     IN NUMBER,
    p_doctor_id      IN NUMBER,
    p_diagnosis      IN CLOB,
    p_symptoms       IN CLOB,
    p_treatment      IN CLOB,
    p_visit_date     IN DATE,
    p_blood_pressure IN VARCHAR2,
    p_temperature    IN NUMBER,
    p_weight         IN NUMBER,
    p_time           IN VARCHAR2
)
AS
BEGIN
  INSERT INTO Visit_specific_record (
    record_id, appointment_id, patient_id, doctor_id,
    diagnosis, symptoms, treatment_notes, visit_date,
    blood_pressure, temperature, weight, time
  )
  VALUES (
    visit_record_seq.NEXTVAL, p_appointment_id, p_patient_id, p_doctor_id,
    p_diagnosis, p_symptoms, p_treatment, p_visit_date,
    p_blood_pressure, p_temperature, p_weight, p_time
  );
END;
/

BEGIN
  ADD_VISIT_RECORD(
    p_appointment_id => 1,
    p_patient_id     => 101,
    p_doctor_id      => 3,
    p_diagnosis      => 'Migraine',
    p_symptoms       => 'Headache, dizziness',
    p_treatment      => 'Pain relief medication',
    p_visit_date     => TO_DATE('2025-12-08', 'YYYY-MM-DD'),
    p_blood_pressure => '120/80',
    p_temperature    => 36.6,
    p_weight         => 65,
    p_time           => '15:30'
  );
END;
/


CREATE OR REPLACE FUNCTION GET_VISIT_GAP(p_patient_id NUMBER)
RETURN NUMBER
AS
  last_visit DATE;
  prev_visit DATE;
BEGIN
  SELECT visit_date INTO last_visit
  FROM (
        SELECT visit_date
        FROM Visit_specific_record
        WHERE patient_id = p_patient_id
        ORDER BY visit_date DESC
       )
  WHERE ROWNUM = 1;

  SELECT visit_date INTO prev_visit
  FROM (
        SELECT visit_date
        FROM Visit_specific_record
        WHERE patient_id = p_patient_id
        ORDER BY visit_date DESC
       )
  WHERE ROWNUM = 2;

  RETURN last_visit - prev_visit;

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
/

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
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (walkin_id) REFERENCES Walkin(walkin_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE
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
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (walkin_id) REFERENCES Walkin(walkin_id) ON DELETE CASCADE,
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
    bill_date DATE NOT NULL,
    total_amount NUMBER(10,2) NOT NULL,
    tax_amount NUMBER(10,2),
    payment_status VARCHAR2(20) NOT NULL,
    payment_method VARCHAR2(50),
    payment_date DATE,
    bill_type VARCHAR2(50),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE,
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
    admission_date DATE NOT NULL,
    discharge_date DATE,
    status VARCHAR2(20),
    appointment_id INTEGER,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE,
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
    FOREIGN KEY (nurse_id) REFERENCES Nurses(nurse_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

CREATE INDEX idx_nurse_assignment_nurse ON Nurse_assignment(nurse_id);
CREATE INDEX idx_nurse_assignment_room ON Nurse_assignment(room_id);

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


-- Create sequence for auto-increment
CREATE SEQUENCE userauth_seq
START WITH 1
INCREMENT BY 1;

-- Create table
CREATE TABLE UserAuth (
    user_id INTEGER PRIMARY KEY,
    username VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(100) NOT NULL,
    role VARCHAR2(20) CHECK (role IN ('doctor', 'admin')) NOT NULL
);

INSERT INTO UserAuth (user_id, username, password, role)
VALUES (userauth_seq.NEXTVAL, 'dr.arjun', 'pass123', 'doctor');

INSERT INTO UserAuth (user_id, username, password, role)
VALUES (userauth_seq.NEXTVAL, 'dr.sara', 'secure456', 'doctor');

INSERT INTO UserAuth (user_id, username, password, role)
VALUES (userauth_seq.NEXTVAL, 'admin1', 'adminpass', 'admin');

INSERT INTO UserAuth (user_id, username, password, role)
VALUES (userauth_seq.NEXTVAL, 'admin2', 'admin123', 'admin');


COMMIT;

-- Insert Doctors
INSERT INTO Doctors VALUES (1, 'Dr. Ahmed Khan', 'Cardiology', '0300-1234567', 'ahmed.khan@hospital.com');
INSERT INTO Doctors VALUES (2, 'Dr. Sara Ali', 'Pediatrics', '0321-2345678', 'sara.ali@hospital.com');
INSERT INTO Doctors VALUES (3, 'Dr. Hassan Raza', 'Orthopedics', '0333-3456789', 'hassan.raza@hospital.com');
INSERT INTO Doctors VALUES (4, 'Dr. Fatima Noor', 'Dermatology', '0345-4567890', 'fatima.noor@hospital.com');
INSERT INTO Doctors VALUES (5, 'Dr. Bilal Sheikh', 'Neurology', '0312-5678901', 'bilal.sheikh@hospital.com');
INSERT INTO Doctors VALUES (doctor_seq.NEXTVAL, 'Dr. Bilal Sheikh', 'Neurology', '0312-5678901', 'bilal.sheikh@hospital.com');
-- Insert Nurses
INSERT INTO Nurses VALUES (1, 'Nurse Ayesha', 'ayesha@hospital.com', '0300-9876543', 'Cardiology');
INSERT INTO Nurses VALUES (2, 'Nurse Zainab', 'zainab@hospital.com', '0321-8765432', 'Pediatrics');
INSERT INTO Nurses VALUES (3, 'Nurse Hina', 'hina@hospital.com', '0333-7654321', 'Orthopedics');
INSERT INTO Nurses VALUES (4, 'Nurse Maria', 'maria@hospital.com', '0345-6543210', 'Emergency');
INSERT INTO Nurses VALUES (5, 'Nurse Sana', 'sana@hospital.com', '0312-5432109', 'ICU');

-- Insert Rooms
INSERT INTO Rooms VALUES (101, 'R-101', 'General', 2, 1);
INSERT INTO Rooms VALUES (102, 'R-102', 'ICU', 1, 1);
INSERT INTO Rooms VALUES (103, 'R-103', 'Private', 1, 1);
INSERT INTO Rooms VALUES (104, 'R-104', 'General', 2, 0);
INSERT INTO Rooms VALUES (105, 'R-105', 'Emergency', 3, 1);

-- Insert Patients
INSERT INTO Patients VALUES (101, 'Ali Raza', '0300-1111111', DATE '1990-05-15', 'Male', 34);
INSERT INTO Patients VALUES (102, 'Sana Ahmed', '0321-2222222', DATE '1985-08-22', 'Female', 39);
INSERT INTO Patients VALUES (103, 'Hamza Khan', '0333-3333333', DATE '2000-12-10', 'Male', 24);
INSERT INTO Patients VALUES (104, 'Aisha Malik', '0345-4444444', DATE '1995-03-18', 'Female', 29);
INSERT INTO Patients VALUES (105, 'Usman Ali', '0312-5555555', DATE '1988-07-25', 'Male', 36);
INSERT INTO Patients VALUES (106, 'Zara Fatima', '0300-6666666', DATE '1992-11-30', 'Female', 32);
INSERT INTO Patients VALUES (107, 'Asad Mehmood', '0321-7777777', DATE '1998-02-14', 'Male', 26);
INSERT INTO Patients VALUES (108, 'Hira Noor', '0333-8888888', DATE '1987-09-05', 'Female', 37);
INSERT INTO Patients VALUES (patient_seq.NEXTVAL, 'sameer Raza', '0300-1111111', DATE '1990-05-15', 'Male', 34);

-- Insert Medical History
INSERT INTO Medical_history VALUES (101, 'O+', 'Penicillin allergy', 'Appendectomy in 2015', 'COVID-19 vaccine (2 doses)', 'Father has diabetes', 'Annual checkup completed');
INSERT INTO Medical_history VALUES (102, 'A+', 'None', 'None', 'All routine vaccinations', 'Mother has hypertension', 'Healthy');
INSERT INTO Medical_history VALUES (103, 'B+', 'Dust allergy', 'Fracture surgery 2018', 'COVID-19 vaccine (3 doses)', 'No family history', 'Regular checkups');
INSERT INTO Medical_history VALUES (104, 'AB+', 'Lactose intolerant', 'None', 'All routine vaccinations', 'Grandmother has heart disease', 'Healthy');
INSERT INTO Medical_history VALUES (105, 'O-', 'Peanut allergy', 'Knee surgery 2020', 'COVID-19 vaccine (2 doses)', 'Brother has asthma', 'Monitoring required');

-- Insert Walk-ins
INSERT INTO Walkin VALUES (1, 101, 3, DATE '2025-01-10', '09:30 AM');
INSERT INTO Walkin VALUES (2, 103, 1, DATE '2025-01-12', '11:00 AM');
INSERT INTO Walkin VALUES (3, 105, 2, DATE '2025-01-15', '02:30 PM');

-- Insert Appointments
INSERT INTO Appointment VALUES ( 1,1, 101, DATE '2025-02-01', '10:00 AM', 'Scheduled');
INSERT INTO Appointment VALUES ( 2,2, 102, DATE '2025-02-01', '11:00 AM', 'Scheduled');
INSERT INTO Appointment VALUES ( 3,3, 103, DATE '2025-02-02', '09:30 AM', 'Scheduled');
INSERT INTO Appointment VALUES ( appointment_seq.NEXTVAL,3, 104, DATE '2025-02-03', '02:00 PM', 'Scheduled');
--INSERT INTO Appointment VALUES ( 5, 105, DATE '2025-02-03', '03:30 PM', 'Scheduled');
--INSERT INTO Appointment VALUES ( 1, 106, DATE '2025-02-04', '10:30 AM', 'Scheduled');
--INSERT INTO Appointment VALUES ( 2, 107, DATE '2025-02-05', '11:30 AM', 'Completed');
--INSERT INTO Appointment VALUES ( 3, 108, DATE '2025-01-25', '01:00 PM', 'Completed');
--INSERT INTO Appointment VALUES ( 1, 102, DATE '2025-01-20', '09:00 AM', 'Completed');
--INSERT INTO Appointment VALUES (10, 4, 103, DATE '2025-01-18', '04:00 PM', 'Cancelled');

--select * from appointment;
-- Insert Visit Specific Records
INSERT INTO Visit_specific_record VALUES (1, 7, 107, 2, 'Common cold', 'Runny nose, cough', 'Rest and fluids recommended', DATE '2025-02-05', '120/80', 37.2, 70.5, '11:30 AM');
INSERT INTO Visit_specific_record VALUES (2, 8, 108, 3, 'Sprained ankle', 'Pain and swelling', 'Ice pack and rest', DATE '2025-01-25', '118/75', 36.8, 65.3, '01:00 PM');
INSERT INTO Visit_specific_record VALUES (3, 9, 102, 1, 'Chest pain checkup', 'Mild discomfort', 'ECG normal, continue medication', DATE '2025-01-20', '130/85', 36.9, 68.2, '09:00 AM');

-- Insert Prescriptions
INSERT INTO Prescription VALUES (1, 7, NULL, 107, 2, 'Paracetamol', '500mg', 'Twice daily', '5 days', 'Take after meals', DATE '2025-02-05');
INSERT INTO Prescription VALUES (2, 8, NULL, 108, 3, 'Ibuprofen', '400mg', 'Three times daily', '7 days', 'Take with food', DATE '2025-01-25');
INSERT INTO Prescription VALUES (3, 9, NULL, 102, 1, 'Aspirin', '75mg', 'Once daily', '30 days', 'Take in morning', DATE '2025-01-20');
INSERT INTO Prescription VALUES (4, NULL, 1, 101, 3, 'Pain reliever', '200mg', 'As needed', '3 days', 'Do not exceed 3 doses per day', DATE '2025-01-10');
INSERT INTO Prescription VALUES (5, NULL, 2, 103, 1, 'Antacid', '500mg', 'After meals', '10 days', 'Take 30 minutes after eating', DATE '2025-01-12');

-- Insert Lab Tests
INSERT INTO Lab_tests VALUES (1, 101, 'Blood Test', 1, NULL, DATE '2025-02-01', DATE '2025-02-03', 'All levels normal', 'Completed');
INSERT INTO Lab_tests VALUES (2, 102, 'ECG', 9, NULL, DATE '2025-01-20', DATE '2025-01-20', 'Normal heart rhythm', 'Completed');
INSERT INTO Lab_tests VALUES (3, 103, 'X-Ray', 3, NULL, DATE '2025-02-02', NULL, 'Pending review', 'Pending');
INSERT INTO Lab_tests VALUES (4, 104, 'Blood Test', 4, NULL, DATE '2025-02-03', NULL, 'Sample collected', 'Pending');
INSERT INTO Lab_tests VALUES (5, 108, 'X-Ray', 8, NULL, DATE '2025-01-25', DATE '2025-01-25', 'No fracture detected', 'Completed');

-- Insert Billing
INSERT INTO Billing VALUES (1, 107, 7,  DATE '2025-02-05', 2500.00, 250.00, 'Paid', 'Cash', DATE '2025-02-05', 'Consultation');
INSERT INTO Billing VALUES (2, 108, 8,  DATE '2025-01-25', 3500.00, 350.00, 'Paid', 'Credit Card', DATE '2025-01-25', 'Consultation + X-Ray');
INSERT INTO Billing VALUES (3, 102, 9,  DATE '2025-01-20', 4000.00, 400.00, 'Paid', 'Insurance', DATE '2025-01-22', 'Consultation + ECG');
INSERT INTO Billing VALUES (4, 101, 1,  DATE '2025-02-01', 3000.00, 300.00, 'Pending', NULL, NULL, 'Consultation + Lab');
INSERT INTO Billing VALUES (5, 103,  2, DATE '2025-01-12', 1500.00, 150.00, 'Paid', 'Cash', DATE '2025-01-12', 'Walk-in Consultation');
INSERT INTO Billing VALUES (bill_seq.NEXTVAL, 104,  2, DATE '2025-01-12', 1500.00, 150.00, 'Paid', 'Cash', DATE '2025-01-12', 'Walk-in Consultation');

-- Insert Room Assignments
INSERT INTO Room_Assignment VALUES (1, 102, 102, DATE '2025-01-20', DATE '2025-01-22', 'Discharged', 9);
INSERT INTO Room_Assignment VALUES (2, 108, 103, DATE '2025-01-25', DATE '2025-01-26', 'Discharged', 8);
INSERT INTO Room_Assignment VALUES (3, 101, 101, DATE '2025-02-01', NULL, 'Active', 1);
INSERT INTO Room_Assignment VALUES (4, 104, 105, DATE '2025-02-03', NULL, 'Active', 4);

-- Insert Nurse Assignments
INSERT INTO Nurse_assignment VALUES (1, 101, 'Morning');
INSERT INTO Nurse_assignment VALUES (1, 102, 'Evening');
INSERT INTO Nurse_assignment VALUES (2, 103, 'Morning');
INSERT INTO Nurse_assignment VALUES (3, 104, 'Night');
INSERT INTO Nurse_assignment VALUES (4, 105, 'Morning');
INSERT INTO Nurse_assignment VALUES (5, 102, 'Night');

CREATE SEQUENCE patient_seq
START WITH 109
INCREMENT BY 1
NOCACHE;

CREATE SEQUENCE appointment_seq
START WITH 4
INCREMENT BY 1
NOCACHE;

CREATE SEQUENCE doctor_seq
START WITH 6
INCREMENT BY 1
NOCACHE;

CREATE SEQUENCE bill_seq
START WITH 6
INCREMENT BY 1
NOCACHE;

cREATE SEQUENCE visit_record_seq
START WITH 6
INCREMENT BY 1
NOCACHE;
COMMIT;

COMMIT;

