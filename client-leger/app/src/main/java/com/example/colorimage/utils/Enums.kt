package com.example.colorimage.utils

enum class ViewType(val value: Int) {
    RIGHT(0),
    LEFT(1);
    companion object {
        fun fromInt(value: Int) = ViewType.values().find { it.value == value }
    }
}