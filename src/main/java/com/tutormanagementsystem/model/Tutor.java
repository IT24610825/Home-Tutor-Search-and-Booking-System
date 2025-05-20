package com.tutormanagementsystem.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class Tutor extends User {
    private String qualifications;
    
    public Tutor(String id, String username, String password, String contact, String qualifications) {
        super(id, username, password, "TUTOR", contact);
        this.qualifications = qualifications;
    }
    
    // Default constructor
    public Tutor() {
        super();
    }
}
