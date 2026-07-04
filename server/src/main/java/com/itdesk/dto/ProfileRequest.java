package com.itdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequest {
    @NotBlank(message = "Full Name is required")
    @Size(max = 100)
    private String fullName;

    private String phone;

    private String department;
}
